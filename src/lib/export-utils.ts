// lib/export-utils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const ExportToPDF = (data: any[], filename = 'Export') => {
  const doc = new jsPDF();

  const tableData = data.map(item => [
    item.title,
    item.type,
    new Date(item.date).toLocaleDateString(),
  ]);

  autoTable(doc, {
    head: [['Title', 'Type', 'Date']],
    body: tableData,
  });

  doc.save(`${filename}.pdf`);
};

export const ExportToExcel = (data: any[], filename = 'Export') => {
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    Title: item.title,
    Type: item.type,
    Date: new Date(item.date).toLocaleDateString(),
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
