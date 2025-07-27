"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Trash2, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  onUpdate: () => void;
}

export function CommentItem({ comment, onUpdate }: CommentItemProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateComment = api.comment.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      onUpdate();
    },
    onError: (error) => {
      alert(`Error updating comment: ${error.message}`);
    },
  });

  const deleteComment = api.comment.delete.useMutation({
    onSuccess: () => {
      onUpdate();
    },
    onError: (error) => {
      alert(`Error deleting comment: ${error.message}`);
    },
  });

  const handleUpdate = () => {
    if (editContent.trim().length === 0) {
      alert("Comment cannot be empty");
      return;
    }
    updateComment.mutate({
      id: comment.id,
      content: editContent.trim(),
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate({ id: comment.id });
    }
  };

  const isAuthor = session?.user?.id === comment.author.id;
  const canModerate = session?.user?.role === "ADMIN";
  const canDelete = isAuthor || canModerate;

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.image || ""} />
            <AvatarFallback>
              {comment.author.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {comment.author.name || "Anonymous"}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {comment.author.role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                
                {(isAuthor || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isAuthor && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem 
                          onClick={handleDelete}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your comment..."
                  maxLength={1000}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {editContent.length}/1000 characters
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={updateComment.isPending || editContent.trim().length === 0}
                    >
                      {updateComment.isPending ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
