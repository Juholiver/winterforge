import { useState, useEffect } from 'react';
import type { JSX } from 'react/jsx-runtime';
import './RestTimer.css';

export default function RestTimer(): JSX.Element {
  const [tempoRestante, setTempoRestante] = useState<number>(60);
  const [timerAtivo, setTimerAtivo] = useState<boolean>(false);
  const [tempoInicial, setTempoInicial] = useState<number>(60);

  useEffect(() => {
    let interval: any = null;
    if (timerAtivo && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);
    } else if (tempoRestante === 0 && timerAtivo) {
      setTimerAtivo(false);
      tocarBeep();
    }
    return () => clearInterval(interval);
  }, [timerAtivo, tempoRestante]);

  const tocarBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      console.log('Áudio não suportado no navegador');
    }
  };

  const iniciarTimer = (segundos: number) => {
    setTempoInicial(segundos);
    setTempoRestante(segundos);
    setTimerAtivo(true);
  };

  const toggleTimer = () => setTimerAtivo(!timerAtivo);
  const resetTimer = () => {
    setTimerAtivo(false);
    setTempoRestante(tempoInicial);
  };

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="wolf-timer-widget">
      <div className="wolf-timer-header">⏱️ DESCANSO</div>
      <div className="wolf-timer-display">{formatarTempo(tempoRestante)}</div>
      <div className="wolf-timer-presets">
        <button type="button" onClick={() => iniciarTimer(30)}>30s</button>
        <button type="button" onClick={() => iniciarTimer(60)}>60s</button>
        <button type="button" onClick={() => iniciarTimer(90)}>90s</button>
      </div>
      <div className="wolf-timer-controls">
        <button type="button" onClick={toggleTimer} className="wolf-btn-timer-action">
          {timerAtivo ? 'Pausar' : 'Iniciar'}
        </button>
        <button type="button" onClick={resetTimer} className="wolf-btn-timer-reset">
          Reset
        </button>
      </div>
    </div>
  );
}