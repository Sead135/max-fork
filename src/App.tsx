import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Show } from './components';
import { ChatPage } from './pages/chat';
import { ConnectPage } from './pages/connect-page';
import { useSession } from './session';
import { Background } from './ui';

type GatePhase = 'in' | 'out' | 'gone';

const GATE_FADE_MS = 450;

export function App() {
  const { state } = useSession();
  const isConnected = state.status === 'connected';
  const [gate, setGate] = useState<GatePhase>(isConnected ? 'gone' : 'in');

  useEffect(() => {
    if (!isConnected) {
      // oxlint-disable-next-line react/set-state-in-effect -- connect gate phase machine
      setGate('in');
      return;
    }
    // oxlint-disable-next-line react/set-state-in-effect -- connect gate phase machine
    setGate('out');
  }, [isConnected]);

  useEffect(() => {
    if (gate !== 'out') {
      return;
    }
    const done = window.setTimeout(() => setGate('gone'), GATE_FADE_MS);
    return () => window.clearTimeout(done);
  }, [gate]);

  return (
    <Main>
      <Show when={isConnected}>
        <ChatPage />
      </Show>

      <Show when={gate !== 'gone'}>
        <Gate $hiding={gate === 'out'} aria-hidden={gate === 'out'}>
          <Background>
            <ConnectPage />
          </Background>
        </Gate>
      </Show>
    </Main>
  );
}

const Main = styled.div`
  position: relative;
  height: 100dvh;
  width: 100%;
`;

const Gate = styled.div<{ $hiding: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 10;
  opacity: ${({ $hiding }) => ($hiding ? 0 : 1)};
  transition: opacity ${GATE_FADE_MS}ms ease;
  pointer-events: ${({ $hiding }) => ($hiding ? 'none' : 'auto')};
`;
