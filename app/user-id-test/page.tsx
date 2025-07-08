import GetUserId from '@/components/GetUserId';

export default function UserIdTest() {
  return (
    <div style={{ minHeight: '100vh', background: '#020218', padding: '20px' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>User ID & Firebase Test</h1>
      <GetUserId />
    </div>
  );
}
