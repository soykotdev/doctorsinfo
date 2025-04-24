import { Suspense } from 'react';
import DoctorPageClient from './DoctorPageClient';
import Loading from '@/components/Loading';

interface Props {
  params: { doctorName: string }
}

// Remove async and handle params synchronously since this is a server component
export default function DoctorPage({ params }: Props) {
  // Use a safe way to handle the doctor name
  const doctorName = params?.doctorName ? decodeURIComponent(params.doctorName) : '';
  
  if (!doctorName) {
    return <div>Invalid doctor name</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <DoctorPageClient doctorName={doctorName} />
    </Suspense>
  );
}
