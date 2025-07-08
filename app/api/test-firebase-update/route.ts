// Get your current user ID
import { auth } from '@/lib/firebaseConfig/firebaseConfig';

const user = auth.currentUser;
if (user) {
  console.log('👤 Your User ID:', user.uid);
  console.log('📧 Your Email:', user.email);
} else {
  console.log('❌ No user logged in');
}
