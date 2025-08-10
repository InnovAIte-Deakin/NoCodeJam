import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: usersData, error } = await supabase
      .from('users')
      .select('id, username, email, role, total_xp');
    
    if (!error && usersData) {
      setUsers(usersData);
    } else {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdatingUserId(userId);
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    
    setUpdatingUserId(null);
    
    if (error) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Role updated',
      description: `User role changed to ${newRole}.`,
    });

    fetchUsers(); // Refresh list
    return true;
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return false;
    }

    setDeletingUserId(userId);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    setDeletingUserId(null);
    
    if (error) {
      toast({
        title: 'Failed to delete user',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'User deleted',
      description: 'The user has been deleted.',
    });

    fetchUsers(); // Refresh list
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updatingUserId,
    deletingUserId,
    refreshUsers: fetchUsers,
    updateUserRole,
    deleteUser,
  };
};
