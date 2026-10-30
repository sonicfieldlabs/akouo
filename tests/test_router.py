import json
import unittest
from pathlib import Path

from akouo_contract import __version__
from akouo_contract.router import ROUTER_ID, has_any_term, route, route_account, rules

FIXTURES = Path(__file__).parent / "fixtures"
ROOT = Path(__file__).resolve().parents[1]


class ReferenceParity(unittest.TestCase):
    def test_packaged_rules_are_the_reference_apps_rules(self):
        shipped = json.loads((ROOT / "app/src/akouo/routerRules.json").read_text())
        self.assertEqual(rules(), shipped)
        self.assertEqual(len(rules()["modes"]), 16)
        self.assertNotIn("agent-native-listening", rules()["modes"], "the reference app scores 16 modes")

    def test_routes_match_the_reference_app(self):
        cases = {c["name"]: c for c in json.loads((FIXTURES / "router-cases.json").read_text())}
        for expected in json.loads((FIXTURES / "router-parity.json").read_text()):
            case = cases[expected["name"]]
            got = route(
                prompt=case.get("prompt", ""),
                object_name=case.get("object_name", ""),
                input_type=case.get("input_type", "unknown"),
                command=case.get("command"),
                audio_inspection=bool(case.get("audio_inspection")),
            )
            with self.subTest(case=expected["name"]):
                for key in ("primary", "secondary", "corrective", "confidence", "route_reasoning"):
                    self.assertEqual(got[key], expected[key], key)

    def test_term_matching_is_whole_word_with_a_plural(self):
        self.assertTrue(has_any_term("Two Songs!", ["song"]))
        self.assertTrue(has_any_term("melodies", ["melody"]))
        self.assertFalse(has_any_term("songbird", ["song"]))
        self.assertFalse(has_any_term("", ["song"]))
        self.assertEqual(ROUTER_ID, f"akouo-contract/router {__version__}")


class AccountRouting(unittest.TestCase):
    def test_music_soundscape_and_material_accounts_route_to_their_ears(self):
        music = route_account("A looped melody over a steady pulse, with a bass drone and a chord change.")
        self.assertEqual(music["primary"], "musical-aesthetic-listening")
        self.assertIn("music", music["heard_as"])
        field = route_account("Birds and wind in a forest; a river runs under the soundscape.")
        self.assertEqual(field["primary"], "ecological-posthuman-listening")
        self.assertIn("soundscape", field["heard_as"])
        matter = route_account("A low rumble with feedback and resonance.")
        self.assertEqual(matter["primary"], "material-event-listening")

    def test_negated_mentions_do_not_count(self):
        account = route_account("No speech or voice is audible; birds and wind in a forest.")
        self.assertNotIn("speech", account["heard_as"])
        self.assertEqual(account["primary"], "ecological-posthuman-listening")

    def test_speech_inside_a_soundscape_does_not_capture_the_route(self):
        account = route_account("A voice speaks over birds in a forest soundscape; a speaker talks.")
        self.assertEqual(account["primary"], "ecological-posthuman-listening")
        self.assertIn("speech", account["heard_as"])
        self.assertIn("does not capture", account["reasoning"])
        voiced = route_account("A voice speaks over birds in a forest soundscape.", command="/voice")
        self.assertEqual(voiced["primary"], "voice-speech-listening")

    def test_an_ambiguous_word_does_not_overturn_a_voice_route(self):
        voiced = route_account("A voice speaks; a speaker talks in an interview.")
        self.assertEqual(voiced["primary"], "voice-speech-listening")
        self.assertIn("speech", voiced["heard_as"])

    def test_a_task_frame_weighs_without_deciding_alone(self):
        framed = route_account("Hiss and a distant hum.", command="/field")
        self.assertEqual(framed["primary"], "ecological-posthuman-listening")
        self.assertIn(framed["confidence"], {"high", "medium", "low"})

    def test_empty_silent_and_generated_accounts(self):
        empty = route_account("")
        self.assertEqual(empty["confidence"], "undetermined")
        self.assertEqual(empty["heard_as"], ["unknown"])
        silent = route_account("Near silence; nothing audible beyond hiss.")
        self.assertIn("silence", silent["heard_as"])
        generated = route_account("A melody.", generated=True)
        self.assertIn("generated", generated["heard_as"])

    def test_the_alternative_reading_points_somewhere_not_yet_heard(self):
        music = route_account("A looped melody over a steady pulse.", heard={"acoulogical-object-listening"})
        self.assertNotIn("acoulogical-object-listening", music["alternative_reading"].split(":")[0])
        self.assertTrue(music["alternative_reading"].startswith("The same excerpt could be heard through"))
        self.assertLessEqual(len(music["reasoning"]), 2000)
        self.assertEqual(music["router"], ROUTER_ID)


if __name__ == "__main__":
    unittest.main()
