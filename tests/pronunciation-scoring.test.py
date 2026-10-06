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
 def test_multilingual_compound_labels_do_not_count_as_missing_english_sounds(self):
  self.assertEqual(m.align_score([('Miller',['m','ɪ','l','ɚ'])],['m','ɪ','l','ə','ɹ'])['score'],100)
  self.assertEqual(m.align_score([('morning',['m','ɔːɹ','n','ɪ','ŋ'])],['m','ɔ','ɹ','n','ɪ','ŋ'])['score'],100)
 def test_coarticulated_grandparent_cluster_is_not_an_omitted_word(self):
  result=m.align_score([('grandma',['ɡ','ɹ','æ','n','d','m','ɑː'])],['ɡ','ɹ','æ','m','a'])
  self.assertGreaterEqual(result['score'],95);self.assertEqual(result['completeness'],100)
  result=m.align_score([('grandpa',['ɡ','ɹ','æ','n','d','p','ɑː'])],['ɡ','ɹ','æ','m','p','a'])
  self.assertEqual(result['score'],100)
  wrong=m.align_score([('grandpa',['ɡ','ɹ','æ','n','d','p','ɑː'])],['ɡ','ɹ','æ','m','a'])
  self.assertLess(wrong['score'],85)
 def test_weak_function_word_vowels_are_accepted_only_in_sentences(self):
  reference=[('to',['t','uː']),('you',['j','uː'])]
  self.assertGreaterEqual(m.align_score(reference,['t','ə','j','ʊ'])['score'],90)
  self.assertLess(m.align_score([('cat',['k','æ','t'])],['k','ə','t'])['score'],90)
 def test_unrelated_function_word_vowels_are_not_perfect_even_in_a_sentence(self):
  are=m.align_score([('are',['ɑ','ɹ']),('you',['j','u'])],['ʊ','j','u'],[1,1,1])
  the=m.align_score([('the',['ð','ə']),('cat',['k','æ','t'])],['ð','ʊ','k','æ','t'],[1]*5)
  self.assertLess(are['words'][0]['score'],100);self.assertLess(the['words'][0]['score'],100)
 def test_similar_sounds_receive_partial_credit_but_wrong_word_stays_low(self):
  near=m.align_score([('cat',['k','æ','t'])],['k','ɛ','t'])
  wrong=m.align_score([('cat',['k','æ','t'])],['d','ɔ','ɡ'])
  self.assertGreater(near['score'],75);self.assertLess(near['score'],100);self.assertLess(wrong['score'],40)
 def test_acoustic_uncertainty_only_softens_related_substitutions(self):
  ref=[('cat',['k','æ','t'])]
  confident=m.align_score(ref,['k','eɪ','t'],[1,1,1])
  uncertain=m.align_score(ref,['k','eɪ','t'],[1,.45,1])
  self.assertGreater(uncertain['score'],confident['score']);self.assertLess(uncertain['score'],95)
  self.assertEqual(m.align_score(ref,['d','ɔ','ɡ'],[.1,.1,.1])['score'],m.align_score(ref,['d','ɔ','ɡ'],[1,1,1])['score'])
 def test_missing_content_word_still_has_zero_score_and_low_completeness(self):
  result=m.align_score([('my',['m','aɪ']),('grandma',['ɡ','ɹ','æ','n','d','m','ɑ'])],['m','aɪ'])
  self.assertEqual(result['words'][1]['score'],0);self.assertEqual(result['words'][1]['errorType'],'Omission');self.assertLess(result['completeness'],50)
 def test_pcm_validation_and_silence(self):
  out=io.BytesIO()
  with wave.open(out,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(b'\0'*32000)
  with self.assertRaisesRegex(ValueError,'speech'):m.read_wav(out.getvalue())
  with self.assertRaises(ValueError):m.read_wav(b'invalid')
if __name__=='__main__':unittest.main()
