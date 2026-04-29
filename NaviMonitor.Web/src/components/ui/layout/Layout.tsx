import Sidebar from '../layout/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="p-6 md:p-8 lg:p-12 max-w-360 mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
