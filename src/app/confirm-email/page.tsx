import { redirect } from 'next/navigation';

export default function ConfirmEmailRedirect() {
	redirect('/en/confirm-email');
}
