'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Upload,
  FileText,
  X,
  Loader2,
  Download,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/providers';
import { supabase } from '@/lib/supabase/client';
import { DOCUMENT_TYPES, MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from '@/lib/constants';
import { formatBytes, formatDate } from '@/lib/loan';
import type { DocumentRecord, DocumentType } from '@/lib/types';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('government_id');

  const loadDocs = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Could not load documents');
      setLoading(false);
      return;
    }
    setDocs(data as DocumentRecord[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large (max 10 MB)');
      return;
    }
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Use PNG, JPG, WebP, or PDF.');
      return;
    }
    setUploading(true);
    try {
      const filePath = `${user.id}/general/${selectedType}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from('documents').insert({
        user_id: user.id,
        application_id: null,
        document_type: selectedType,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: filePath,
        status: 'uploaded',
      });
      if (dbErr) throw dbErr;

      await loadDocs();
      toast.success(`${file.name} uploaded`);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 60);
      if (error || !data) throw error;
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('Could not download file');
    }
  };

  const handleDelete = async (doc: DocumentRecord) => {
    setUploading(true);
    try {
      await supabase.storage.from('documents').remove([doc.storage_path]);
      await supabase.from('documents').delete().eq('id', doc.id);
      await loadDocs();
      toast.success('Document deleted');
    } catch {
      toast.error('Could not delete document');
    } finally {
      setUploading(false);
    }
  };

  const grouped = DOCUMENT_TYPES.map((dt) => ({
    ...dt,
    items: docs.filter((d) => d.document_type === dt.value),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Documents</h1>
        <p className="mt-1 text-muted-foreground">Upload and manage your supporting documents securely.</p>
      </div>

      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5" /> Upload a document</CardTitle>
          <CardDescription>Choose a document type and select a file to upload.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document type</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as DocumentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/40 hover:bg-accent/5">
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <Upload className="h-7 w-7 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {uploading ? 'Uploading…' : 'Click to select a file'}
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG, WebP, or PDF (max 10 MB)</span>
            <input
              type="file"
              className="sr-only"
              accept={ACCEPTED_FILE_TYPES.join(',')}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = '';
              }}
            />
          </label>
        </CardContent>
      </Card>

      {/* Documents grouped by type */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <FolderOpen className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload your government ID, proof of income, and other supporting documents to speed up your applications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) =>
            group.items.length > 0 ? (
              <Card key={group.value}>
                <CardHeader>
                  <CardTitle className="text-base">{group.label}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.items.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.file_size ? formatBytes(doc.file_size) : ''} · {formatDate(doc.created_at)}
                            {doc.application_id ? ' · Linked to application' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{doc.status}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)} title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} className="text-destructive hover:text-destructive" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
