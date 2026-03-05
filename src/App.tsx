import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  School, 
  GraduationCap,
  Trophy,
  RotateCcw
} from 'lucide-react';
import questionsData from './soal.json';

type Question = {
  q: string;
  a: string[];
  correct: number;
};

type Level = {
  id: number;
  title: string;
  material: string;
  ascii: string;
  questions: Question[];
};

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'level' | 'levelValidation' | 'finalQuiz' | 'userInfo' | 'result'>('start');
  const [showMaterial, setShowMaterial] = useState(true);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [userData, setUserData] = useState({ name: '', class: '', school: '' });
  const [progress, setProgress] = useState(0);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [levelAnswers, setLevelAnswers] = useState<number[]>([]);
  const [validationResult, setValidationResult] = useState<{ correct: number; total: number } | null>(null);

  const levels: Level[] = questionsData.levels;
  const finalQuiz: Question[] = questionsData.finalQuiz;

  const successMessages = [
    "Luar biasa! Kamu telah menguasai level ini dengan sempurna! 🛠️",
    "Hebat! Semua jawabanmu tepat. Kamu benar-benar calon mekanik handal! 🎯",
    "Sempurna! Kamu siap melangkah ke tantangan berikutnya! 🚀",
    "Mantap! Pengetahuanmu tentang mesin 4 tak sangat mengesankan! 🔥"
  ];

  const retryMessages = [
    "Hampir sampai! Ada beberapa bagian yang perlu kamu tinjau kembali. 💪",
    "Jangan menyerah! Mekanik hebat belajar dari setiap kesalahan. Ayo coba lagi! ⚡",
    "Sedikit lagi! Periksa kembali jawabanmu agar mesin bisa bekerja sempurna! 🧐",
    "Ayo semangat! Kamu pasti bisa menyelesaikan level ini dengan benar semua! 🔧"
  ];

  const getRandomMessage = (type: 'success' | 'retry') => {
    const msgs = type === 'success' ? successMessages : retryMessages;
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const strokes = [
    { name: 'HISAP (Intake)', desc: 'Piston bergerak dari TMA ke TMB. Katup masuk terbuka, campuran udara dan bahan bakar terhisap ke dalam silinder.', color: 'bg-blue-400', pistonPos: 'translate-y-0' },
    { name: 'KOMPRESI (Compression)', desc: 'Piston bergerak dari TMB ke TMA. Kedua katup tertutup. Campuran udara dan bahan bakar dikompresi sehingga tekanan dan suhu naik.', color: 'bg-orange-400', pistonPos: '-translate-y-10' },
    { name: 'USAHA (Power)', desc: 'Busi memercikkan bunga api. Terjadi ledakan yang mendorong piston dari TMA ke TMB. Inilah langkah yang menghasilkan tenaga.', color: 'bg-red-500', pistonPos: 'translate-y-0' },
    { name: 'BUANG (Exhaust)', desc: 'Piston bergerak dari TMB ke TMA. Katup buang terbuka, sisa pembakaran didorong keluar menuju knalpot.', color: 'bg-slate-500', pistonPos: '-translate-y-10' }
  ];

  useEffect(() => {
    if (gameState === 'level' && showMaterial && currentLevelIdx === 0) {
      const interval = setInterval(() => {
        setStrokeIdx((prev) => (prev + 1) % 4);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameState, showMaterial, currentLevelIdx]);

  useEffect(() => {
    const totalSteps = levels.length * 6 + finalQuiz.length; // 1 material + 4 questions + 1 validation per level
    let currentStep = 0;
    if (gameState === 'level') {
      currentStep = currentLevelIdx * 6 + (showMaterial ? 0 : currentQuestionIdx + 1);
    } else if (gameState === 'levelValidation') {
      currentStep = currentLevelIdx * 6 + 5;
    } else if (gameState === 'finalQuiz') {
      currentStep = levels.length * 6 + currentQuestionIdx;
    } else if (gameState === 'result') {
      currentStep = totalSteps;
    }
    setProgress((currentStep / totalSteps) * 100);
  }, [gameState, currentLevelIdx, currentQuestionIdx, showMaterial]);

  const handleStart = () => {
    setGameState('level');
    setShowMaterial(true);
    setLevelAnswers([]);
  };

  const handleAnswer = (idx: number) => {
    const newAnswers = [...levelAnswers, idx];
    setLevelAnswers(newAnswers);
    
    const currentLevel = levels[currentLevelIdx];
    if (currentQuestionIdx < currentLevel.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Validate level
      let correctCount = 0;
      currentLevel.questions.forEach((q, i) => {
        if (newAnswers[i] === q.correct) correctCount++;
      });
      setValidationResult({ correct: correctCount, total: currentLevel.questions.length });
      setGameState('levelValidation');
    }
  };

  const proceedToNextLevel = () => {
    setScore(s => s + (validationResult?.correct || 0) * 10);
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(currentLevelIdx + 1);
      setCurrentQuestionIdx(0);
      setLevelAnswers([]);
      setShowMaterial(true);
      setGameState('level');
    } else {
      setGameState('finalQuiz');
      setCurrentQuestionIdx(0);
      setLevelAnswers([]);
    }
  };

  const retryLevel = () => {
    setCurrentQuestionIdx(0);
    setLevelAnswers([]);
    setGameState('level');
  };

  const handleFinalAnswer = (idx: number) => {
    const question = finalQuiz[currentQuestionIdx];
    if (idx === question.correct) {
      setScore(s => s + 10);
    }

    if (currentQuestionIdx < finalQuiz.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setGameState('userInfo');
    }
  };

  const calculateFinalScore = () => {
    const totalQuestions = (levels.length * 4) + finalQuiz.length;
    return Math.round((score / (totalQuestions * 10)) * 100);
  };

  const finalPercentage = calculateFinalScore();

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-800 border-2 border-blue-600 rounded-2xl p-8 shadow-2xl text-center"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-1">GASPOL 4.0</h2>
            <p className="text-[10px] leading-tight text-blue-400 font-bold uppercase px-4">
              Game Automotive Smart Problem-Oriented Learning 4.0
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg shadow-blue-500/20">
              <Wrench className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-blue-400">ENGINE 4T</h1>
          <p className="text-xl font-bold mb-6 text-slate-400 uppercase tracking-widest">Challenge</p>
          
          <div className="bg-slate-700/50 p-4 rounded-xl mb-8 text-sm text-left border border-slate-600">
            <p className="font-mono text-blue-300 mb-2"># STATUS_MESIN: RUSAK</p>
            <p className="text-slate-300 italic">"Selamat datang, mekanik muda! Mesin 4 tak ini butuh keahlianmu. Pelajari materi di setiap level dan selesaikan tantangannya."</p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/30"
          >
            <Play className="w-5 h-5 fill-current" /> MULAI PETUALANGAN
          </button>
          <p className="mt-8 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            &copy; KALIMMUSTOFA AUTOMOTIVE EDUCATION
          </p>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'level' || gameState === 'levelValidation' || gameState === 'finalQuiz') {
    const isLevel = gameState === 'level' || gameState === 'levelValidation';
    const currentLevel = levels[currentLevelIdx];
    const question = (gameState === 'level') ? currentLevel.questions[currentQuestionIdx] : (gameState === 'finalQuiz' ? finalQuiz[currentQuestionIdx] : null);

    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          {/* Branding */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tighter">GASPOL 4.0</h2>
            <p className="text-[8px] font-bold text-blue-600 uppercase">Game Automotive Smart Problem-Oriented Learning 4.0</p>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                {isLevel ? `LEVEL ${currentLevel.id}` : 'KUIS AKHIR'}
              </h2>
              <h1 className="text-2xl font-black text-slate-800">
                {isLevel ? currentLevel.title : 'Uji Kompetensi'}
              </h1>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full mb-8 overflow-hidden border border-slate-300">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          {gameState === 'levelValidation' && validationResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="flex justify-center mb-6">
                {validationResult.correct === validationResult.total ? (
                  <div className="bg-emerald-100 p-4 rounded-full">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                ) : (
                  <div className="bg-rose-100 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-rose-600" />
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-black mb-4">
                {validationResult.correct === validationResult.total ? 'Level Selesai!' : 'Belum Sempurna!'}
              </h3>
              
              <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                {validationResult.correct === validationResult.total 
                  ? getRandomMessage('success')
                  : `${getRandomMessage('retry')} (Masih ada ${validationResult.total - validationResult.correct} soal yang salah)`}
              </p>

              <div className="bg-slate-50 p-4 rounded-xl mb-8 flex justify-around items-center border border-slate-100">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Benar</p>
                  <p className="text-2xl font-black text-emerald-600">{validationResult.correct}</p>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Soal</p>
                  <p className="text-2xl font-black text-slate-800">{validationResult.total}</p>
                </div>
              </div>

              {validationResult.correct === validationResult.total ? (
                <button 
                  onClick={proceedToNextLevel}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                >
                  LANJUT KE TAHAP BERIKUTNYA <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={retryLevel}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-rose-600/20"
                >
                  ULANGI LEVEL INI <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}

          {isLevel && showMaterial && gameState === 'level' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm"
            >
              <h3 className="font-black text-blue-600 mb-6 flex items-center gap-2 text-xl uppercase tracking-tight">
                <AlertCircle className="w-6 h-6" /> MATERI LEVEL {currentLevel.id}
              </h3>

              {currentLevel.id === 1 ? (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-40 h-56 bg-slate-100 rounded-3xl border-4 border-slate-300 relative flex flex-col items-center justify-end p-2 overflow-hidden shadow-inner">
                      {/* Intake Port */}
                      <div className="absolute top-0 left-0 w-12 h-12 bg-blue-100 border-r-4 border-b-4 border-slate-300 rounded-br-3xl -translate-x-2 -translate-y-2" />
                      {/* Exhaust Port */}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-rose-100 border-l-4 border-b-4 border-slate-300 rounded-bl-3xl translate-x-2 -translate-y-2" />
                      
                      {/* Valves */}
                      <div className="absolute top-2 w-full flex justify-around px-6 z-20">
                        {/* Intake Valve */}
                        <div className="flex flex-col items-center">
                          <div className="w-1 h-6 bg-slate-500" />
                          <motion.div 
                            animate={{ 
                              y: strokeIdx === 0 ? 8 : 0,
                              backgroundColor: strokeIdx === 0 ? '#34d399' : '#94a3b8' // emerald-400 : slate-400
                            }}
                            className="w-6 h-3 rounded-b-xl border-2 border-slate-600"
                          />
                        </div>
                        {/* Exhaust Valve */}
                        <div className="flex flex-col items-center">
                          <div className="w-1 h-6 bg-slate-500" />
                          <motion.div 
                            animate={{ 
                              y: strokeIdx === 3 ? 8 : 0,
                              backgroundColor: strokeIdx === 3 ? '#fb7185' : '#94a3b8' // rose-400 : slate-400
                            }}
                            className="w-6 h-3 rounded-b-xl border-2 border-slate-600"
                          />
                        </div>
                      </div>

                      {/* Cylinder Walls Overlay */}
                      <div className="absolute inset-x-4 top-12 bottom-0 border-x-4 border-slate-300 bg-white/30 z-0" />
                      
                      {/* Piston */}
                      <motion.div 
                        animate={{ y: strokes[strokeIdx].pistonPos === 'translate-y-0' ? 0 : -55 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`w-24 h-20 ${strokes[strokeIdx].color} rounded-xl border-4 border-slate-800 z-10 flex flex-col items-center justify-center shadow-lg transition-colors duration-500`}
                      >
                        <div className="w-16 h-1 bg-white/40 rounded-full mb-1" />
                        <div className="w-16 h-1 bg-white/20 rounded-full mb-1" />
                        <div className="w-16 h-1 bg-white/20 rounded-full" />
                      </motion.div>
                      
                      {/* Connecting Rod */}
                      <motion.div 
                        animate={{ height: strokes[strokeIdx].pistonPos === 'translate-y-0' ? 40 : 95 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="w-3 bg-slate-500 z-0 rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={strokeIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-widest">
                            Langkah {strokeIdx + 1}
                          </div>
                          <h4 className="text-2xl font-black text-slate-800">{strokes[strokeIdx].name}</h4>
                          <p className="text-slate-600 leading-relaxed font-medium">{strokes[strokeIdx].desc}</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {strokes.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-500 ${idx === strokeIdx ? 'bg-blue-600 w-full' : 'bg-slate-200 w-full'}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                    <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line">{currentLevel.material}</p>
                  </div>
                  <div className="bg-slate-800 text-emerald-400 p-6 rounded-2xl font-mono text-sm overflow-x-auto whitespace-pre leading-tight border-l-8 border-emerald-500 shadow-inner">
                    {currentLevel.ascii}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowMaterial(false)}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                SAYA MENGERTI, LANJUT KE PERTANYAAN <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {gameState !== 'levelValidation' && (!showMaterial || !isLevel) && question && (
            <motion.div 
              key={`${gameState}-${currentLevelIdx}-${currentQuestionIdx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl relative overflow-hidden"
            >
              {/* Piston Animation (Simple CSS) */}
              <div className="absolute right-4 top-4 w-12 h-20 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-end p-1">
                <motion.div 
                  animate={{ y: [0, -40, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 bg-blue-500 rounded-sm border-2 border-blue-700 flex items-center justify-center"
                >
                  <div className="w-4 h-1 bg-blue-300 opacity-50"></div>
                </motion.div>
                <div className="w-1 h-10 bg-slate-400"></div>
              </div>

              <p className="text-xs font-bold text-slate-400 mb-2">PERTANYAAN {currentQuestionIdx + 1}</p>
              <h3 className="text-xl font-bold text-slate-800 mb-8 pr-12">{question.q}</h3>

              <div className="grid gap-3">
                {question.a.map((ans, idx) => (
                  <button 
                    key={idx}
                    onClick={() => isLevel ? handleAnswer(idx) : handleFinalAnswer(idx)}
                    className="group text-left p-4 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-4"
                  >
                    <span className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-bold text-slate-500 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-700 font-medium">{ans}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          <footer className="mt-8 text-center">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              &copy; KALIMMUSTOFA AUTOMOTIVE EDUCATION
            </p>
          </footer>
        </div>
      </div>
    );
  }

  if (gameState === 'userInfo') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-tighter">GASPOL 4.0</h2>
          <p className="text-[8px] font-bold text-blue-400 uppercase">Game Automotive Smart Problem-Oriented Learning 4.0</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Data Siswa</h2>
              <p className="text-slate-500 text-sm">Isi data untuk melihat hasil kuis</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-slate-800 font-medium"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Kelas</label>
              <div className="relative">
                <ArrowRight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={userData.class}
                  onChange={(e) => setUserData({ ...userData, class: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-slate-800 font-medium"
                  placeholder="Contoh: XI TKR 1"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Asal Sekolah</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  value={userData.school}
                  onChange={(e) => setUserData({ ...userData, school: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-slate-800 font-medium"
                  placeholder="Contoh: SMKN 1 Kademangan Blitar"
                />
              </div>
            </div>

            <button 
              onClick={() => setGameState('result')}
              disabled={!userData.name || !userData.class || !userData.school}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl mt-4 transition-all shadow-lg shadow-blue-600/20"
            >
              LIHAT HASIL AKHIR
            </button>
            <p className="mt-8 text-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              &copy; KALIMMUSTOFA AUTOMOTIVE EDUCATION
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'result') {
    const isPassed = finalPercentage >= 75;

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter">GASPOL 4.0</h2>
          <p className="text-[8px] font-bold text-blue-600 uppercase">Game Automotive Smart Problem-Oriented Learning 4.0</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          <div className={`p-10 text-center ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
            {isPassed ? (
              <Trophy className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
            ) : (
              <AlertCircle className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
            )}
            <h2 className="text-4xl font-black mb-2">NILAI: {finalPercentage}</h2>
            <p className="text-xl font-bold opacity-90">
              {isPassed ? 'MESIN BERHASIL DIPERBAIKI!' : 'MESIN MASIH MOGOK!'}
            </p>
          </div>

          <div className="p-8">
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Nama</p>
                  <p className="text-slate-800 font-black">{userData.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Kelas</p>
                  <p className="text-slate-800 font-black">{userData.class}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Sekolah</p>
                  <p className="text-slate-800 font-black">{userData.school}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Status Kelulusan:</span>
                <span className={`font-black px-3 py-1 rounded-lg ${isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {isPassed ? 'LULUS' : 'TIDAK LULUS'}
                </span>
              </div>
              
              <p className="text-center text-slate-500 text-sm italic px-4">
                {isPassed 
                  ? "Luar biasa! Kamu memiliki pemahaman yang sangat baik tentang mesin 4 tak. Terus asah kemampuanmu!"
                  : "Jangan menyerah! Pelajari lagi prinsip dasar dan komponen mesin 4 tak, lalu coba lagi."}
              </p>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setGameState('start');
                    setScore(0);
                    setCurrentLevelIdx(0);
                    setCurrentQuestionIdx(0);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-5 h-5" /> COBA LAGI
                </button>
              </div>
              <p className="mt-8 text-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                &copy; KALIMMUSTOFA AUTOMOTIVE EDUCATION
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
