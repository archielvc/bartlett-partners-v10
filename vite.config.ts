
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'figma:asset/eff7752e202363e477a1693bdffb4a157ae49ec2.png': path.resolve(__dirname, './src/assets/eff7752e202363e477a1693bdffb4a157ae49ec2.png'),
      'figma:asset/d901f468f65556224c5e173ba89ac6c618f6443a.png': path.resolve(__dirname, './src/assets/d901f468f65556224c5e173ba89ac6c618f6443a.png'),
      'figma:asset/c871281ba89915299095d1acb405af1269fd12c8.png': path.resolve(__dirname, './src/assets/c871281ba89915299095d1acb405af1269fd12c8.png'),
      'figma:asset/befb57e6127cf9c51ac594208e78e62fa716d7ae.png': path.resolve(__dirname, './src/assets/befb57e6127cf9c51ac594208e78e62fa716d7ae.png'),
      'figma:asset/bc1f3ddd6eab3ebc4b8b1ee320abe524c1baebbb.png': path.resolve(__dirname, './src/assets/bc1f3ddd6eab3ebc4b8b1ee320abe524c1baebbb.png'),
      'figma:asset/a49a304c14bdb50701e6c3c6ec4ac8419c70162c.png': path.resolve(__dirname, './src/assets/a49a304c14bdb50701e6c3c6ec4ac8419c70162c.png'),
      'figma:asset/5b62f8c03e2b13d2ace0a1eb4d56e1cdcc75416b.png': path.resolve(__dirname, './src/assets/5b62f8c03e2b13d2ace0a1eb4d56e1cdcc75416b.png'),
      'figma:asset/599b02647465336e4f2b1c1445e1b239d3eed18a.png': path.resolve(__dirname, './src/assets/599b02647465336e4f2b1c1445e1b239d3eed18a.png'),
      'figma:asset/4dc31e3d4d8476a091118f1ea8f376b69a8e629a.png': path.resolve(__dirname, './src/assets/4dc31e3d4d8476a091118f1ea8f376b69a8e629a.png'),
      '@supabase/supabase-js@2': '@supabase/supabase-js',
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
});