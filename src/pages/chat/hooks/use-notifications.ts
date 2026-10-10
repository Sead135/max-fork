import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GreenAPI, sleep, type Credentials } from '../../../api';
import { applyNotificationMessage } from '../lib/apply-notification';

export function useNotifications(
  credentials: Credentials | null,
  selectedId: string | null
) {
  const queryClient = useQueryClient();
  const selectedRef = useRef(selectedId);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    const api = new GreenAPI(credentials);
    const controller = new AbortController();

    const loop = async () => {
      while (!controller.signal.aborted) {
        try {
          const receipt = await api.receiveNotification({
            receiveTimeout: 5,
            signal: controller.signal
          });

          if (!receipt) {
            await sleep(1000);
            continue;
          }

          const parsed = api.parseNotification(receipt.body);
          if (parsed) {
            applyNotificationMessage(
              queryClient,
              credentials,
              parsed,
              selectedRef.current
            );
          }

          await api.deleteNotification(receipt.receiptId);
        } catch (error) {
          if (controller.signal.aborted) {
            break;
          }
          if (error instanceof DOMException && error.name === 'AbortError') {
            break;
          }
          await sleep(5000);
        }
      }
    };

    void loop();

    return () => {
      controller.abort();
    };
  }, [credentials, queryClient]);
}
