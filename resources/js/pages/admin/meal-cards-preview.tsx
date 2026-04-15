import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

export default function MealCardsPreview({ students, hall }: { students: any[], hall: any }) {
    const chunkArray = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const pages = chunkArray(students, 6);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <Head title="Meal Cards Preview" />
            
            <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => window.close()} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to List
                    </Button>
                    <h1 className="text-xl font-bold">Meal Cards Preview ({students.length})</h1>
                </div>
                <Button onClick={handlePrint} className="flex items-center gap-2 px-8 py-6 text-lg font-bold">
                    <Printer className="h-5 w-5" />
                    Print / Download PDF
                </Button>
            </div>

            <div className="print-container">
                {pages.map((pageStudents, pageIdx) => (
                    <div key={pageIdx} className="a4-page bg-white shadow-lg mx-auto mb-8 overflow-hidden print:shadow-none print:m-0 print:break-after-page">
                        <div className="grid grid-cols-2 grid-rows-3 h-full">
                            {pageStudents.map((student, studentIdx) => (
                                <div key={studentIdx} className="card-cell p-[5mm] border-[0.2pt] border-gray-100 flex items-start justify-center overflow-hidden">
                                    <div className="meal-card border-[1pt] border-black p-[4mm] w-full min-h-[50mm] bg-white text-black font-serif relative">
                                        <div className="card-header border-b-[0.5pt] border-black pb-2 mb-3 flex items-center">
                                            <img src="/images/logo/logo.png" alt="Logo" className="w-[12mm] h-[12mm] mr-3 object-contain" />
                                            <div className="text-center flex-1">
                                                <div className="text-[11pt] font-bold leading-tight">{hall?.name || 'Hall Name'}</div>
                                                <div className="text-[10pt] leading-tight mt-1">Meal Card</div>
                                            </div>
                                        </div>
                                        <div className="card-body text-[10pt] space-y-1">
                                            <div className="flex">
                                                <span className="font-bold w-[30%]">UID:</span>
                                                <span className="w-[70%] font-mono font-bold">{student.unique_id}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-bold w-[30%]">Student ID:</span>
                                                <span className="w-[70%]">{student.student_id}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-bold w-[30%]">Name:</span>
                                                <span className="w-[70%] truncate">{student.name}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-bold w-[30%]">Dept, Batch:</span>
                                                <span className="w-[70%]">{student.department}, {student.batch}</span>
                                            </div>
                                            <div className="flex">
                                                <span className="font-bold w-[30%]">Meat Pref:</span>
                                                <span className="w-[70%] font-bold uppercase">{student.meat_preference || 'BEEF'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&display=swap');
                
                .font-serif {
                    font-family: 'Times New Roman', serif;
                }

                @page {
                    size: A4 portrait;
                    margin: 0;
                }

                @media print {
                    body {
                        margin: 0;
                        background: white;
                    }
                    .bg-gray-100 {
                        background: white !important;
                    }
                    .p-4, .p-8 {
                        padding: 0 !important;
                    }
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    .a4-page {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-after: always;
                    }
                    .print-container {
                        width: 100%;
                    }
                    .a4-page:last-child {
                        page-break-after: avoid;
                    }
                }

                @media screen {
                    .a4-page {
                        width: 210mm;
                        height: 297mm;
                        margin-bottom: 2rem;
                    }
                }
            `}} />
        </div>
    );
}
