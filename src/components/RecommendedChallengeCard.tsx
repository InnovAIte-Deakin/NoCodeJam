import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, Trophy, Sparkles } from 'lucide-react';
import type { Challenge } from '@/types';

interface RecommendedChallengeCardProps {
  challenge: Challenge & { score?: number; reason?: string };
}

export function RecommendedChallengeCard({ challenge }: RecommendedChallengeCardProps) {
  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-blue-100 text-blue-800',
    'Advanced': 'bg-orange-100 text-orange-800',
    'Expert': 'bg-red-100 text-red-800',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{challenge.title}</CardTitle>
            {challenge.reason && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {challenge.reason}
              </p>
            )}
          </div>
          <Badge className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
            {challenge.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{challenge.estimated_time}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>{challenge.xp_reward} XP</span>
          </div>
        </div>
        <Link to={`/challenges/${challenge.id}`} className="block">
          <Button className="w-full">
            Start Challenge
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
