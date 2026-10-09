import json
import unittest
from copy import deepcopy
from pathlib import Path
from unittest.mock import Mock
from akouo_contract.spectral_gate import extended_spectrum_decision
from akouo_contract.validation import contract_errors

ROOT = Path(__file__).resolve().parents[1]


class SpectralGateTest(unittest.TestCase):
    def setUp(self):
        self.access = json.loads((ROOT / "tests/fixtures/spectral-access.json").read_text())
        self.request = json.loads((ROOT / "examples/extended-spectrum-request-example.json").read_text())
        # Unit boundary only: host supplies Earworm's validator. The combined
        # installed-package smoke uses the actual Earworm implementation.
        self.validator = Mock(return_value=[])

    def assess(self):
        return extended_spectrum_decision(self.access, self.request, actor="agent:fixture",
            validate_access=self.validator, schemas_dir=ROOT / "schemas")

    def test_declared_support_is_not_a_measurement_or_authority(self):
        original = deepcopy((self.access, self.request))
        result = self.assess()
        self.assertEqual(result["support"], "supported")
        self.assertTrue(result["measurement_permitted"])
        self.assertEqual(result["claim_status"], "undetermined")
        self.assertEqual(result["decision"]["authority"]["mode"], "observe_only")
        self.assertTrue(result["decision"]["authority"]["requires_confirmation"])
        self.assertEqual(contract_errors("route-decision", result["decision"], schemas_dir=ROOT / "schemas"), [])
        self.validator.assert_called_once_with(self.access)
        self.assertEqual((self.access, self.request), original)

    def test_invalid_access_abstains(self):
        self.validator.return_value = ["Invalid model band"]
        result = self.assess()
        self.assertEqual(result["support"], "undetermined")
        self.assertEqual(result["decision"]["outcome"], "abstain")

    def test_missing_physical_capture_never_derived_from_sample_rate(self):
        for status in ("unknown", "unavailable", "withheld", "not_applicable"):
            self.access["capture"] = {"status": status, "reason": "No supported physical chain."}
            self.assertEqual(self.assess()["support"], "undetermined")

    def test_effective_model_band_is_enforced(self):
        self.request["band_hz"] = {"lower":10000, "upper":20000}
        result = self.assess()
        self.assertEqual(result["support"], "unsupported")
        self.assertFalse(result["measurement_permitted"])

    def test_capture_band_is_enforced(self):
        self.request["band_hz"]["lower"] = 1
        self.assertEqual(self.assess()["support"], "unsupported")

    def test_window_and_channels_are_enforced(self):
        self.request["window_s"]["end"] = 11
        self.assertEqual(self.assess()["support"], "unsupported")
        self.request["window_s"]["end"] = 10
        self.request["channel_count"] = 2
        self.assertEqual(self.assess()["support"], "unsupported")

    def test_blind_spots_require_specific_evidence(self):
        self.access["model_input"]["blind_spots"] = ["No reliable tonal discrimination is established."]
        self.assertEqual(self.assess()["support"], "undetermined")

    def test_unresolved_evidence_abstains(self):
        self.request["resolved_refs"].remove("calibration:fixture")
        self.assertEqual(self.assess()["support"], "undetermined")

    def test_missing_or_disconnected_preprocessing(self):
        self.request["preprocessing"][0]["input_ref"] = "repr:other"
        self.assertEqual(self.assess()["support"], "undetermined")
        self.request["preprocessing"] = []
        self.assertEqual(self.assess()["support"], "undetermined")

    def test_translation_needs_mapping_not_direct_band_comparison(self):
        for kind in ("frequency_translation", "playback_rate_change", "pitch_shift", "unknown"):
            self.request["preprocessing"][0]["kind"] = kind
            self.request["band_hz"] = {"lower":20000, "upper":30000}
            self.assertEqual(self.assess()["support"], "undetermined")

    def test_native_understanding_hearing_and_spl_not_established(self):
        for kind in ("native_understanding", "embodied_hearing", "spl"):
            self.request["claim_kind"] = kind
            self.assertFalse(self.assess()["measurement_permitted"])
            self.assertEqual(self.assess()["claim_status"], "undetermined")

    def test_unknown_subject_and_contract(self):
        self.request["subject_ref"] = "asset:other"
        self.assertEqual(self.assess()["support"], "undetermined")
        self.access["contract"] = "earworm/listening-access/v9"
        self.assertEqual(self.assess()["support"], "undetermined")

    def test_invalid_request_is_rejected(self):
        for value in (float("inf"), float("nan"), -1):
            self.request["band_hz"]["lower"] = value
            with self.assertRaises(ValueError):
                self.assess()
        self.request["band_hz"] = {"lower":1000, "upper":100}
        with self.assertRaises(ValueError):
            self.assess()

    def test_invalid_validator_result_is_rejected(self):
        self.validator.return_value = False
        with self.assertRaises(TypeError):
            self.assess()

    def test_installed_schema_bundle(self):
        self.assertEqual(extended_spectrum_decision(self.access, self.request, actor="agent:fixture",
            validate_access=self.validator)["support"], "supported")

    def test_identity_cannot_hide_rate_conversion(self):
        self.request["preprocessing"][0]["kind"] = "identity"
        self.assertEqual(self.assess()["support"], "undetermined")

    def test_channel_change_requires_its_own_mapping(self):
        self.access["sampled_representation"]["channels"] = 2
        self.assertEqual(self.assess()["support"], "undetermined")
