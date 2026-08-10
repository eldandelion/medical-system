import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

export function useRecordProgress(assessmentId: string | undefined, answers: Record<string, number>) {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  // Track latest answers for unmount flush
  const latestAnswers = useRef(answers);
  const isFirstRender = useRef(true);

  useEffect(() => {
    latestAnswers.current = answers;
  }, [answers]);

  const mutation = useMutation({
    mutationFn: async (answersToSave: Record<string, number>) => {
      if (!assessmentId) return;
      
      const res = await fetch(`${import.meta.env.BASE_URL}/api/assessments/${assessmentId}/progress`.replace('//api', '/api'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: answersToSave })
      });
      
      if (!res.ok) {
        throw new Error('Failed to save progress');
      }
    },
    onError: () => {
      showSnackbar({ message: '保存进度失败，请检查网络', duration: 3000 });
    }
  });

  useEffect(() => {
    if (!assessmentId) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (Object.keys(answers).length === 0) return;

    const timer = setTimeout(() => {
      mutation.mutate(answers);
    }, 2000);

    return () => clearTimeout(timer);
  }, [answers, assessmentId]);

  useEffect(() => {
    return () => {
      // Flush on unmount if we have answers and an ID
      if (assessmentId && Object.keys(latestAnswers.current).length > 0) {
        // Use navigator.sendBeacon or fetch keepalive in a real robust app,
        // but for now we simply fire the fetch synchronously.
        fetch(`${import.meta.env.BASE_URL}/api/assessments/${assessmentId}/progress`.replace('//api', '/api'), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          },
          keepalive: true,
          body: JSON.stringify({ answers: latestAnswers.current })
        }).catch(e => console.error("Unmount save failed", e));
      }
    };
  }, [assessmentId, session.token]);

  return mutation;
}
