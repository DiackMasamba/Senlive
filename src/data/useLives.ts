import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { lives as demoLives, type Live } from './mock';

const palette = ['#FF7A59', '#2EB67D', '#3D7BF7', '#A259FF', '#0B2D6F', '#E84A8A'];

type LiveRow = {
  id: string;
  title: string;
  category_id: string;
  is_premium: boolean;
  viewer_count: number;
  host: { username: string | null; display_name: string | null } | null;
};

// Lives en cours depuis Supabase ; tant qu'il n'y en a aucun, on montre les lives de démo.
export function useLives() {
  const [lives, setLives] = useState<Live[]>(demoLives);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('lives')
      .select('id, title, category_id, is_premium, viewer_count, host:profiles!lives_host_id_fkey(username, display_name)')
      .eq('status', 'live')
      .order('viewer_count', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return;
        setLives(
          (data as unknown as LiveRow[]).map((row, i) => ({
            id: row.id,
            title: row.title,
            host: row.host?.display_name ?? row.host?.username ?? 'Créateur',
            handle: `@${row.host?.username ?? 'senlive'}`,
            category: row.category_id,
            viewers: row.viewer_count,
            premium: row.is_premium,
            color: palette[i % palette.length],
          })),
        );
        setIsDemo(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { lives, isDemo };
}
