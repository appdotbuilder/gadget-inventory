import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Building,
  MapPin,
  Crown,
  User as UserIcon,
  Search
} from 'lucide-react';
import type { User, CreateUserInput, UpdateUserInput } from '../../../server/src/schema';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states
  const [addFormData, setAddFormData] = useState<CreateUserInput>({
    nik: '',
    name: '',
    position: '',
    unit: '',
    location: '',
    user_type: 'user'
  });

  const [editFormData, setEditFormData] = useState<UpdateUserInput>({
    id: 0,
    nik: '',
    name: '',
    position: '',
    unit: '',
    location: '',
    user_type: 'user'
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getUsers.query();
      setUsers(result);
      setFilteredUsers(result);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user: User) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newUser = await trpc.createUser.mutate(addFormData);
      setUsers((prev: User[]) => [...prev, newUser]);
      
      // Reset form
      setAddFormData({
        nik: '',
        name: '',
        position: '',
        unit: '',
        location: '',
        user_type: 'user'
      });
      
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsLoading(true);
    
    try {
      const updatedUser = await trpc.updateUser.mutate(editFormData);
      setUsers((prev: User[]) => 
        prev.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    try {
      await trpc.deleteUser.mutate({ id: deletingUser.id });
      setUsers((prev: User[]) => prev.filter(user => user.id !== deletingUser.id));
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setDeletingUser(null);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      id: user.id,
      nik: user.nik,
      name: user.name,
      position: user.position,
      unit: user.unit,
      location: user.location,
      user_type: user.user_type
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-gray-900">👥 User Management</h2>
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} users
          </Badge>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Add New User
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add_nik">NIK *</Label>
                <Input
                  id="add_nik"
                  value={addFormData.nik}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddFormData((prev: CreateUserInput) => ({ ...prev, nik: e.target.value }))
                  }
                  placeholder="Employee NIK"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_name">Name *</Label>
                <Input
                  id="add_name"
                  value={addFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddFormData((prev: CreateUserInput) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_position">Position *</Label>
                <Input
                  id="add_position"
                  value={addFormData.position}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddFormData((prev: CreateUserInput) => ({ ...prev, position: e.target.value }))
                  }
                  placeholder="Job position"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_unit">Unit *</Label>
                <Input
                  id="add_unit"
                  value={addFormData.unit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddFormData((prev: CreateUserInput) => ({ ...prev, unit: e.target.value }))
                  }
                  placeholder="Department/Unit"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_location">Location *</Label>
                <Input
                  id="add_location"
                  value={addFormData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddFormData((prev: CreateUserInput) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Work location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add_user_type">User Type *</Label>
                <Select 
                  value={addFormData.user_type} 
                  onValueChange={(value: 'admin' | 'user') => 
                    setAddFormData((prev: CreateUserInput) => ({ ...prev, user_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">👤 User</SelectItem>
                    <SelectItem value="admin">👑 Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name, NIK, position, unit, or location..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Start by adding your first user"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user: User) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      {user.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <span className="font-mono">{user.nik}</span>
                    </p>
                  </div>
                  <Badge className={user.user_type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                    {user.user_type === 'admin' ? (
                      <><Crown className="h-3 w-3 mr-1" />Admin</>
                    ) : (
                      <><UserIcon className="h-3 w-3 mr-1" />User</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Position */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{user.position}</span>
                </div>

                {/* Unit */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{user.unit}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-400 pt-2 border-t">
                  Created: {user.created_at.toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingUser(user)}
                    className="gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User: {editingUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_nik">NIK</Label>
              <Input
                id="edit_nik"
                value={editFormData.nik}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateUserInput) => ({ ...prev, nik: e.target.value }))
                }
                placeholder="Employee NIK"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_name">Name</Label>
              <Input
                id="edit_name"
                value={editFormData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateUserInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_position">Position</Label>
              <Input
                id="edit_position"
                value={editFormData.position}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateUserInput) => ({ ...prev, position: e.target.value }))
                }
                placeholder="Job position"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_unit">Unit</Label>
              <Input
                id="edit_unit"
                value={editFormData.unit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateUserInput) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="Department/Unit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_location">Location</Label>
              <Input
                id="edit_location"
                value={editFormData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateUserInput) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Work location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_user_type">User Type</Label>
              <Select 
                value={editFormData.user_type || 'user'} 
                onValueChange={(value: 'admin' | 'user') => 
                  setEditFormData((prev: UpdateUserInput) => ({ ...prev, user_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">👤 User</SelectItem>
                  <SelectItem value="admin">👑 Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              <br />
              <strong>User:</strong> {deletingUser?.name} ({deletingUser?.nik})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}