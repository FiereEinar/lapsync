import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Activity } from 'lucide-react';

export default function RunnerStatus() {
	const runnerStatus = [
		{
			bibNumber: '001',
			name: 'John Doe',
			rfidStatus: 'Active',
			heartRate: 145,
			lastSeen: '2 min ago',
		},
		{
			bibNumber: '002',
			name: 'Jane Smith',
			rfidStatus: 'Active',
			heartRate: 152,
			lastSeen: '1 min ago',
		},
		{
			bibNumber: '003',
			name: 'Mike Johnson',
			rfidStatus: 'Active',
			heartRate: 138,
			lastSeen: '3 min ago',
		},
	];

	return (
		<Card className='rounded-xl border border-border shadow-sm'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-xl'>
					<div className='w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center'>
						<Activity className='w-5 h-5 text-red-500' />
					</div>
					RFID & Biosignal Status
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='rounded-xl border border-border overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30">
								<TableHead className="font-semibold">Bib #</TableHead>
								<TableHead className="font-semibold">Name</TableHead>
								<TableHead className="font-semibold">RFID Status</TableHead>
								<TableHead className="font-semibold">Heart Rate (BPM)</TableHead>
								<TableHead className="font-semibold">Last Seen</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{runnerStatus.map((runner) => (
								<TableRow key={runner.bibNumber} className="hover:bg-muted/30 transition-colors">
									<TableCell className='font-medium'>
										{runner.bibNumber}
									</TableCell>
									<TableCell>{runner.name}</TableCell>
									<TableCell>
										<Badge className='bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-0 uppercase tracking-wider text-[10px]'>
											{runner.rfidStatus}
										</Badge>
									</TableCell>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Activity className='w-4 h-4 text-red-500' />
											<span className='font-mono'>{runner.heartRate}</span>
										</div>
									</TableCell>
									<TableCell className='text-muted-foreground'>
										{runner.lastSeen}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
