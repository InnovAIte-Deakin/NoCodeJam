import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChallengeEditModalProps {
  challenge: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: any) => void;
}

export const ChallengeEditModal = ({ challenge, isOpen, onClose, onSave }: ChallengeEditModalProps) => {
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    xp_reward: 200,
    requirements: [] as string[],
  });

  useEffect(() => {
    if (challenge) {
      setEditData({
        title: challenge.title || '',
        description: challenge.description || '',
        difficulty: challenge.difficulty || 'Beginner',
        xp_reward: challenge.xp_reward || 200,
        requirements: Array.isArray(challenge.requirements) 
          ? challenge.requirements 
          : (challenge.requirements || '').split(';').map((r: string) => r.trim()).filter(Boolean),
      });
    }
  }, [challenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editData);
  };

  const addRequirement = () => {
    setEditData({
      ...editData,
      requirements: [...editData.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...editData.requirements];
    updated[index] = value;
    setEditData({
      ...editData,
      requirements: updated
    });
  };

  const removeRequirement = (index: number) => {
    if (editData.requirements.length > 1) {
      const updated = editData.requirements.filter((_, i) => i !== index);
      setEditData({
        ...editData,
        requirements: updated
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Challenge</h2>
            <Button variant="outline" onClick={onClose}>✕</Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={editData.difficulty}
                  onValueChange={(value) => setEditData({ ...editData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-xp">XP Reward</Label>
                <Input
                  id="edit-xp"
                  type="number"
                  value={editData.xp_reward}
                  onChange={(e) => setEditData({ ...editData, xp_reward: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label>Requirements</Label>
              <div className="space-y-2 mt-2">
                {editData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {editData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRequirement}
                >
                  + Add Requirement
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
