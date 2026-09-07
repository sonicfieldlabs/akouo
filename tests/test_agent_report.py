import json
import unittest
from copy import deepcopy
from pathlib import Path

from akouo_contract.agent_report import agent_report_errors

ROOT = Path(__file__).resolve().parents[1]


class AgentReportTest(unittest.TestCase):
    def setUp(self):
        self.report = json.loads((ROOT / "examples/agent-report-example.json").read_text())

    def errors(self, report=None):
        return agent_report_errors(self.report if report is None else report, schemas_dir=ROOT / "schemas")

    def test_valid_and_unmodified(self):
        before = deepcopy(self.report)
        self.assertEqual(self.errors(), [])
        self.assertEqual(self.report, before)

    def test_categories_are_not_confidence_levels(self):
        for category in ("measured", "inferred", "interpreted", "speculative", "undetermined"):
            self.report["features"][0]["category"] = category
            self.assertEqual(self.errors(), [])

    def test_no_machine_heard_category(self):
        self.report["features"][0]["category"] = "heard"
        self.assertTrue(self.errors())

    def test_explicit_unknown_feature(self):
        self.report["features"][0]["value"] = {"status": "unknown", "reason": "No supported measurement."}
        self.assertEqual(self.errors(), [])
        self.report["features"][0]["value"]["value"] = 0
        self.assertTrue(self.errors())

    def test_requires_evidence_and_units(self):
        for field in ("unit", "value"):
            report = deepcopy(self.report)
            del report["features"][0]["value"][field]
            self.assertTrue(self.errors(report))
        self.report["features"][0]["claim"]["evidence_refs"] = []
        self.assertTrue(self.errors())

    def test_report_local_references(self):
        self.report["features"][0]["claim"]["listening_pass_id"] = "pass:other"
        self.assertTrue(self.errors())

    def test_no_duplicate_feature_or_claim_ids(self):
        self.report["features"].append(deepcopy(self.report["features"][0]))
        self.assertTrue(self.errors())
        self.report["features"][1]["feature_id"] = "feature:other"
        self.assertTrue(self.errors())

    def test_report_of_report_retains_reference(self):
        self.report["report_of_refs"] = ["report:prior"]
        self.assertEqual(self.errors(), [])
        self.report["report_of_refs"] = [self.report["report_id"]]
        self.assertTrue(self.errors())

    def test_full_recipient_taxonomy(self):
        for kind in ("human", "agent", "hybrid", "community", "institution", "sensor", "habitat", "other_animal", "ensemble", "other"):
            self.report["recipients"][0]["type"] = kind
            self.assertEqual(self.errors(), [])
        self.report["recipients"].append({"id": self.report["recipients"][0]["id"], "type": "human"})
        self.assertTrue(self.errors())

    def test_inverted_claim_window(self):
        self.report["features"][0]["claim"]["time_range"] = {"start_s": 2, "end_s": 1}
        self.assertTrue(self.errors())

    def test_unknown_contract_and_extra_authority_rejected(self):
        self.report["contract"] = "akouo/agent-report/v9"
        self.assertTrue(self.errors())
        self.report["contract"] = "akouo/agent-report/v0.1"
        self.report["may_execute"] = True
        self.assertTrue(self.errors())

    def test_installed_schema_bundle(self):
        self.assertEqual(agent_report_errors(self.report), [])

    def test_nonfinite_measurement(self):
        for number in (float("nan"), float("inf")):
            self.report["features"][0]["value"]["value"] = number
            self.assertTrue(self.errors())
