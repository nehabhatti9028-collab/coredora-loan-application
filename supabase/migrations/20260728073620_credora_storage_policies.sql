

DROP POLICY IF EXISTS "select_own_documents_storage" ON storage.objects;
CREATE POLICY "select_own_documents_storage" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "insert_own_documents_storage" ON storage.objects;
CREATE POLICY "insert_own_documents_storage" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "update_own_documents_storage" ON storage.objects;
CREATE POLICY "update_own_documents_storage" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "delete_own_documents_storage" ON storage.objects;
CREATE POLICY "delete_own_documents_storage" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );
