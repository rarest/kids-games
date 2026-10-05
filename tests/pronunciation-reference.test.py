import importlib.util,pathlib,unittest,shutil
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('speech_reference',ROOT/'platform/speech_reference.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ReferenceTests(unittest.TestCase):
 def test_target_words_include_printed_numbers(self):self.assertEqual(m.target_words('Unit 1. How are you?'),['Unit','1','How','are','you'])
 def test_explicit_phoneme_boundaries_preserve_english_glides(self):self.assertEqual(m.tokenize('j_ˈuː_n_ɪ_t',['ju','uː','j','n','ɪ','t']),['j','uː','n','ɪ','t'])
 def test_ipa_longest_tokens(self):self.assertEqual(m.tokenize('kˈæ_t',['k','æ','t']),['k','æ','t'])
 @unittest.skipUnless(shutil.which('espeak-ng'),'espeak-ng not installed')
 def test_espeak_preserves_final_letter(self):self.assertIn('t',m.espeak('cat'));self.assertIn('z',m.espeak('friends'))
if __name__=='__main__':unittest.main()
