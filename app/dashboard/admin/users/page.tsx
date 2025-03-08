"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  status: string
}

export default function ManageUsers() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, auth_users:id(email, created_at, status)")
        .order("created_at", { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      // In a real implementation, you would update the user's status in your auth system
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { status },
      })

      if (error) throw error

      toast({
        title: "User status updated",
        description: `User status has been updated to ${status}.`,
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error updating user status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="mb-6">
        <Input
          placeholder="Search users by name, email, or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "suspended"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>Manage this user's account</DialogDescription>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium">Name</p>
                                <p>{selectedUser.full_name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <p>{selectedUser.email}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Role</p>
                                <p>{selectedUser.role}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <p>{selectedUser.status}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => updateUserStatus(selectedUser.id, "active")} variant="default">
                                  Activate
                                </Button>
                                <Button
                                  onClick={() => updateUserStatus(selectedUser.id, "suspended")}
                                  variant="destructive"
                                >
                                  Suspend
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

