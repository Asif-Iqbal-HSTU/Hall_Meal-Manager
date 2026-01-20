import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';

interface ParsedStudent {
    room_number: string;
    student_id: string;
    name: string;
    department: string;
    batch: string;
    [key: string]: any;
}

export default function BulkImportModal() {
    const [open, setOpen] = useState(false);
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
    const [step, setStep] = useState(1);
    const [isImporting, setIsImporting] = useState(false);

    const parseData = () => {
        const lines = rawData.trim().split('\n');
        const results: ParsedStudent[] = [];
        let lastRoom = '';

        lines.forEach((line) => {
            const cols = line.split('\t').map((c) => c.trim());
            // Skip headers if any (Assuming: Room, Student ID, Name, Dept, Batch)
            if (cols[0] === 'Room' || cols[1] === 'Student ID') return;

            // SKIP ROWS: Skip if Student ID or Name is missing
            // Adjust indices based on expected paste format without Unique ID
            // Old indices: 0: Unique ID, 1: Room, 2: Student ID, 3: Name, 4: Dept, 5: Batch
            // New expected indices (Room, Student ID, Name, Dept, Batch):
            // 0: Room, 1: Student ID, 2: Name, 3: Dept, 4: Batch
            if (!cols[1] || !cols[2]) return;

            const room = cols[0] || lastRoom;
            if (room) lastRoom = room;

            let name = cols[2];
            let meatPreference = 'beef';

            if (name.endsWith(' M') || name.endsWith('M')) {
                meatPreference = 'mutton';
                if (name.endsWith(' M')) {
                    name = name.slice(0, -2).trim();
                }
            }

            results.push({
                room_number: room || '',
                student_id: cols[1] || '',
                name: name,
                department: cols[3] || '',
                batch: cols[4] || '',
                meat_preference: meatPreference,
            });
        });

        setParsedData(results);
        setStep(2);
    };

    const handleImport = () => {
        setIsImporting(true);
        router.post('/admin/students/bulk', { students: parsedData }, {
            onSuccess: () => {
                setOpen(false);
                setStep(1);
                setRawData('');
            },
            onFinish: () => {
                setIsImporting(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={isImporting ? undefined : setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Bulk Import</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Import Members</DialogTitle>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Paste data from Excel (Copy columns: Room, Student ID, Name, Dept, Batch)</Label>
                            <textarea
                                className="w-full h-64 p-2 border rounded-md font-mono text-xs"
                                placeholder="Paste here..."
                                value={rawData}
                                onChange={(e) => setRawData(e.target.value)}
                            />
                        </div>
                        <Button onClick={parseData} disabled={!rawData.trim()}>Next: Preview</Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="overflow-x-auto border rounded-md">
                            <table className="w-full text-xs">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="p-2 border-b text-left">Room</th>
                                        <th className="p-2 border-b text-left">ID / Ref</th>
                                        <th className="p-2 border-b text-left">Name</th>
                                        <th className="p-2 border-b text-left">Dept</th>
                                        <th className="p-2 border-b text-left">Batch</th>
                                        <th className="p-2 border-b text-left">Preference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((s, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">{s.room_number}</td>
                                            <td className="p-2">{s.student_id}</td>
                                            <td className="p-2">{s.name}</td>
                                            <td className="p-2">{s.department}</td>
                                            <td className="p-2">{s.batch}</td>
                                            <td className="p-2 capitalize text-[10px] font-bold">
                                                <span className={s.meat_preference === 'mutton' ? 'text-orange-600' : 'text-green-600'}>
                                                    {s.meat_preference}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleImport} disabled={isImporting}>
                                {isImporting ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Importing...
                                    </>
                                ) : (
                                    `Confirm & Import ${parsedData.length} Members`
                                )}
                            </Button>
                            <Button variant="ghost" onClick={() => setStep(1)} disabled={isImporting}>Back</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
