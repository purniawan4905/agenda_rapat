import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Meeting, MeetingMinutes, Attendance } from '../types';

export const exportMeetingToPDF = async (meeting: Meeting, minutes?: MeetingMinutes, attendances?: Attendance[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Use html2canvas to capture the HTML content
  const canvas = await html2canvas(document.getElementById('meetingMinutes')!);
  const dataURL = canvas.toDataURL();
  pdf.addImage(dataURL, 'PNG', 0, yPosition, pageWidth, pageHeight - yPosition);

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOTULENSI RAPAT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Meeting Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const meetingInfo = [
    `Judul: ${meeting.title}`,
    `Tanggal: ${format(new Date(meeting.date), 'dd MMMM yyyy', { locale: id })}`,
    `Waktu: ${meeting.startTime} - ${meeting.endTime}`,
    `Lokasi: ${meeting.location}`,
    `Penyelenggara: ${typeof meeting.organizer === 'object' ? meeting.organizer.name : meeting.organizer}`
  ];

  meetingInfo.forEach(info => {
    pdf.text(info, 20, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Attendees
  if (meeting.attendees && meeting.attendees.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('PESERTA RAPAT:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    meeting.attendees.forEach((attendee, index) => {
      pdf.text(`${index + 1}. ${attendee.name} (${attendee.email})`, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Attendance if available
  if (attendances && attendances.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('DAFTAR HADIR:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    attendances.forEach((attendance, index) => {
      const statusText = {
        'present': 'Hadir',
        'absent': 'Tidak Hadir',
        'late': 'Terlambat',
        'excused': 'Izin'
      }[attendance.status] || attendance.status;
      
      pdf.text(`${index + 1}. ${attendance.participant.name} - ${statusText}`, 25, yPosition);
      yPosition += 6;
      
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
    });
    yPosition += 10;
  }

  // Meeting Minutes
  if (minutes) {
    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('ISI RAPAT:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    const contentLines = pdf.splitTextToSize(minutes.content, pageWidth - 40);
    contentLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Decisions
    if (minutes.decisions && minutes.decisions.length > 0) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('KEPUTUSAN:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      minutes.decisions.forEach((decision, index) => {
        const decisionText = typeof decision === 'string' ? decision : decision.description;
        const decisionLines = pdf.splitTextToSize(`${index + 1}. ${decisionText}`, pageWidth - 40);
        decisionLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 25, yPosition);
          yPosition += 6;
        });
      });
      yPosition += 10;
    }

    // Action Items
    if (minutes.actionItems && minutes.actionItems.length > 0) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('TINDAK LANJUT:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      minutes.actionItems.forEach((item, index) => {
        const assignedTo = typeof item.assignedTo === 'object' ? item.assignedTo.name : item.assignedTo;
        const dueDate = format(new Date(item.dueDate), 'dd MMM yyyy', { locale: id });
        const actionText = `${index + 1}. ${item.description} (PIC: ${assignedTo}, Deadline: ${dueDate})`;
        
        const actionLines = pdf.splitTextToSize(actionText, pageWidth - 40);
        actionLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 25, yPosition);
          yPosition += 6;
        });
      });
    }
  }

  // Footer
  const currentDate = format(new Date(), 'dd MMMM yyyy', { locale: id });
  pdf.setFontSize(10);
  pdf.text(`Dicetak pada: ${currentDate}`, 20, pageHeight - 10);

  // Save PDF
  const fileName = `Notulensi_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(meeting.date), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
};

export const exportAttendanceToPDF = async (meeting: Meeting, attendances: Attendance[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DAFTAR HADIR RAPAT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Meeting Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const meetingInfo = [
    `Judul: ${meeting.title}`,
    `Tanggal: ${format(new Date(meeting.date), 'dd MMMM yyyy', { locale: id })}`,
    `Waktu: ${meeting.startTime} - ${meeting.endTime}`,
    `Lokasi: ${meeting.location}`
  ];

  meetingInfo.forEach(info => {
    pdf.text(info, 20, yPosition);
    yPosition += 8;
  });

  yPosition += 15;

  // Table Header
  pdf.setFont('helvetica', 'bold');
  pdf.text('No.', 20, yPosition);
  pdf.text('Nama', 40, yPosition);
  pdf.text('Email', 100, yPosition);
  pdf.text('Status', 150, yPosition);
  pdf.text('Waktu Check-in', 180, yPosition);
  
  // Draw line under header
  pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
  yPosition += 10;

  // Table Content
  pdf.setFont('helvetica', 'normal');
  attendances.forEach((attendance, index) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
      
      // Repeat header on new page
      pdf.setFont('helvetica', 'bold');
      pdf.text('No.', 20, yPosition);
      pdf.text('Nama', 40, yPosition);
      pdf.text('Email', 100, yPosition);
      pdf.text('Status', 150, yPosition);
      pdf.text('Waktu Check-in', 180, yPosition);
      pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
      yPosition += 10;
      pdf.setFont('helvetica', 'normal');
    }

    const statusText = {
      'present': 'Hadir',
      'absent': 'Tidak Hadir',
      'late': 'Terlambat',
      'excused': 'Izin'
    }[attendance.status] || attendance.status;

    const checkInTime = attendance.checkInTime 
      ? format(new Date(attendance.checkInTime), 'HH:mm', { locale: id })
      : '-';

    pdf.text(`${index + 1}.`, 20, yPosition);
    pdf.text(attendance.participant.name, 40, yPosition);
    pdf.text(attendance.participant.email, 100, yPosition);
    pdf.text(statusText, 150, yPosition);
    pdf.text(checkInTime, 180, yPosition);
    
    yPosition += 8;
  });

  // Summary
  yPosition += 10;
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.text('RINGKASAN:', 20, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  const summary = {
    total: attendances.length,
    present: attendances.filter(a => a.status === 'present').length,
    absent: attendances.filter(a => a.status === 'absent').length,
    late: attendances.filter(a => a.status === 'late').length,
    excused: attendances.filter(a => a.status === 'excused').length
  };

  pdf.text(`Total Peserta: ${summary.total}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Hadir: ${summary.present}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Tidak Hadir: ${summary.absent}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Terlambat: ${summary.late}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Izin: ${summary.excused}`, 20, yPosition);

  // Footer
  const currentDate = format(new Date(), 'dd MMMM yyyy', { locale: id });
  pdf.setFontSize(10);
  pdf.text(`Dicetak pada: ${currentDate}`, 20, pageHeight - 10);

  // Save PDF
  const fileName = `Daftar_Hadir_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(meeting.date), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
};