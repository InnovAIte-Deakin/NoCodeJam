import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Plus } from 'lucide-react';
import { BadgeDefinition, BadgeCriteria } from '../types';

interface BadgeFormProps {
  initialBadge?: BadgeDefinition;
  onSave: (badge: Omit<BadgeDefinition, 'id'> | BadgeDefinition) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CRITERIA_TYPES = [
  { value: 'challenges_completed', label: 'Challenges Completed' },
  { value: 'xp_earned', label: 'XP Earned' },
  { value: 'first_challenge', label: 'First Challenge' },
  { value: 'difficulty_master', label: 'Difficulty Master' },
  { value: 'leaderboard_position', label: 'Leaderboard Position' },
  { value: 'streak', label: 'Streak' },
  { value: 'expert_challenges', label: 'Expert Challenges' }
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

const ICON_SUGGESTIONS = [
  '🏆', '🥇', '🥈', '🥉', '⭐', '💎', '🔥', '💪', '🎯', '🚀', 
  '⚡', '🌟', '👑', '🏅', '🎖️', '💫', '🎪', '🎨', '🔮', '💡'
];

export default function BadgeForm({ initialBadge, onSave, onCancel, isLoading = false }: BadgeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    criteria: {
      type: 'challenges_completed' as BadgeCriteria['type'],
      value: 1,
      additional: {}
    }
  });
  
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [iconInput, setIconInput] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialBadge) {
      setFormData({
        name: initialBadge.name,
        description: initialBadge.description,
        icon_url: initialBadge.icon_url,
        criteria: initialBadge.criteria
      });
      setIconInput(initialBadge.icon_url);
      
      if (initialBadge.criteria.type === 'difficulty_master' && initialBadge.criteria.additional?.difficulty) {
        setSelectedDifficulties(initialBadge.criteria.additional.difficulty);
      }
    }
  }, [initialBadge]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Badge name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Badge description is required';
    }

    if (!formData.icon_url.trim()) {
      newErrors.icon_url = 'Badge icon is required';
    }

    if (!formData.criteria.type) {
      newErrors.criteria_type = 'Criteria type is required';
    }

    if (formData.criteria.value <= 0) {
      newErrors.criteria_value = 'Criteria value must be positive';
    }

    if (formData.criteria.type === 'difficulty_master' && selectedDifficulties.length === 0) {
      newErrors.difficulties = 'At least one difficulty level is required for difficulty master badges';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const badgeData = {
        ...formData,
        icon_url: iconInput,
        criteria: {
          ...formData.criteria,
          additional: formData.criteria.type === 'difficulty_master' 
            ? { difficulty: selectedDifficulties }
            : formData.criteria.type === 'streak'
            ? { consecutiveDays: formData.criteria.value }
            : {}
        }
      };

      if (initialBadge) {
        await onSave({ ...badgeData, id: initialBadge.id });
      } else {
        await onSave(badgeData);
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save badge' });
    }
  };

  const handleCriteriaTypeChange = (type: BadgeCriteria['type']) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        type,
        value: 1,
        additional: {}
      }
    }));
    setSelectedDifficulties([]);
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const selectIcon = (icon: string) => {
    setIconInput(icon);
    setFormData(prev => ({ ...prev, icon_url: icon }));
    setShowIconPicker(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {initialBadge ? 'Edit Badge' : 'Create New Badge'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Badge Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter badge name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Badge Icon</Label>
              <div className="flex gap-2">
                <Input
                  id="icon"
                  value={iconInput}
                  onChange={(e) => {
                    setIconInput(e.target.value);
                    setFormData(prev => ({ ...prev, icon_url: e.target.value }));
                  }}
                  placeholder="Enter emoji or URL"
                  className={errors.icon_url ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                >
                  {iconInput && (
                    <span className="text-lg mr-1">{iconInput}</span>
                  )}
                  Pick
                </Button>
              </div>
              {errors.icon_url && <p className="text-sm text-red-500">{errors.icon_url}</p>}
              
              {showIconPicker && (
                <div className="grid grid-cols-10 gap-1 p-3 border rounded-md bg-muted/50">
                  {ICON_SUGGESTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => selectIcon(icon)}
                      className="text-lg p-1 hover:bg-muted rounded transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe how this badge is earned"
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Criteria Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Badge Criteria</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="criteria-type">Criteria Type</Label>
                <Select
                  value={formData.criteria.type}
                  onValueChange={handleCriteriaTypeChange}
                >
                  <SelectTrigger className={errors.criteria_type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRITERIA_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.criteria_type && <p className="text-sm text-red-500">{errors.criteria_type}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="criteria-value">
                  {formData.criteria.type === 'leaderboard_position' ? 'Position' : 'Value'}
                </Label>
                <Input
                  id="criteria-value"
                  type="number"
                  min="1"
                  value={formData.criteria.value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    criteria: { ...prev.criteria, value: parseInt(e.target.value) || 1 }
                  }))}
                  className={errors.criteria_value ? 'border-red-500' : ''}
                />
                {errors.criteria_value && <p className="text-sm text-red-500">{errors.criteria_value}</p>}
              </div>
            </div>

            {/* Difficulty Master specific options */}
            {formData.criteria.type === 'difficulty_master' && (
              <div className="space-y-2">
                <Label>Difficulty Levels</Label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map((difficulty) => (
                    <Badge
                      key={difficulty}
                      variant={selectedDifficulties.includes(difficulty) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDifficulty(difficulty)}
                    >
                      {difficulty}
                      {selectedDifficulties.includes(difficulty) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                {errors.difficulties && <p className="text-sm text-red-500">{errors.difficulties}</p>}
              </div>
            )}

            {/* Criteria description */}
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                {getCriteriaDescription(formData.criteria.type, formData.criteria.value, selectedDifficulties)}
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialBadge ? 'Update Badge' : 'Create Badge'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function getCriteriaDescription(type: BadgeCriteria['type'], value: number, difficulties: string[]): string {
  switch (type) {
    case 'challenges_completed':
      return `Badge will be awarded when a user completes ${value} challenge${value !== 1 ? 's' : ''}.`;
    case 'xp_earned':
      return `Badge will be awarded when a user earns ${value} XP in total.`;
    case 'first_challenge':
      return 'Badge will be awarded when a user completes their first challenge.';
    case 'difficulty_master':
      return `Badge will be awarded when a user completes ${value} challenge${value !== 1 ? 's' : ''} of ${difficulties.join(', ')} difficulty.`;
    case 'leaderboard_position':
      return `Badge will be awarded when a user reaches position ${value} or higher on the leaderboard.`;
    case 'streak':
      return `Badge will be awarded when a user maintains a ${value}-day streak of completing challenges.`;
    case 'expert_challenges':
      return `Badge will be awarded when a user completes ${value} expert-level challenge${value !== 1 ? 's' : ''}.`;
    default:
      return 'Badge criteria will be evaluated automatically.';
  }
}
