import importlib.util, pathlib, unittest, io, wave
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('speech_scoring',ROOT/'platform/speech_scoring.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ScoringTests(unittest.TestCase):
 def test_exact_vs_wrong_phonemes(self):
  reference=[('cat',['k','æ','t']),('dog',['d','ɔ','ɡ'])]
  exact=m.align_score(reference,['k','æ','t','d','ɔ','ɡ'])
  wrong=m.align_score(reference,['h','ɛ','l','oʊ'])
  self.assertEqual(exact['score'],100)
  self.assertGreater(exact['score'],wrong['score'])
  self.assertEqual(len(exact['words']),2)
 def test_missing_word(self):
  result=m.align_score([('cat',['k','æ','t']),('dog',['d','ɔ','ɡ'])],['k','æ','t'])
  self.assertEqual(result['completeness'],50)
  self.assertEqual(result['words'][1]['errorType'],'Omission')
 def test_insertions_lower_similarity(self):
  self.assertLess(m.align_score([('cat',['k','æ','t'])],['k','æ','t','d','ɔ','ɡ'])['score'],100)
 def test_english_vowel_length_marker_is_not_a_wrong_vowel(self):
  self.assertEqual(m.align_score([('dog',['d','ɑː','ɡ'])],['d','ɑ','ɡ'])['score'],100)
 def test_no_speech_is_rejected(self):
  with self.assertRaises(ValueError):m.align_score([('cat',['k','æ','t'])],[])
 def test_pcm_validation_and_silence(self):
  out=io.BytesIO()
  with wave.open(out,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(b'\0'*32000)
  with self.assertRaisesRegex(ValueError,'speech'):m.read_wav(out.getvalue())
  with self.assertRaises(ValueError):m.read_wav(b'invalid')
if __name__=='__main__':unittest.main()
