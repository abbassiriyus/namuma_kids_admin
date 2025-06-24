'use client';

import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import QoshimchaModal from '@/components/QoshimchaModal';
import axios from 'axios';
import url from '@/host/host';
import AdminHeader from '@/components/AdminHeader';
import ChiqimFilter from '@/components/ChiqimFilter';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  ShadingType
} from 'docx';
import { saveAs } from 'file-saver';

export default function QoshimchaPage() {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    products: [] // faqat ChiqimFilter bilan mos bo‘lishi uchun
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${url}/chiqim_qoshimcha`, authHeader);
      setData(res.data);
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/chiqim_qoshimcha/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleSave = async (form) => {
    try {
      if (editingItem) {
        await axios.put(`${url}/chiqim_qoshimcha/${editingItem.id}`, form, authHeader);
      } else {
        await axios.post(`${url}/chiqim_qoshimcha`, form, authHeader);
      }
      fetchData();
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('start', filter.startDate);
      if (filter.endDate) params.append('end', filter.endDate);

      const res = await axios.get(`${url}/chiqim_qoshimcha?${params.toString()}`, authHeader);
      setData(res.data);
    } catch (err) {
      console.error("Filterlashda xatolik:", err);
    }
  };

  const handleExportToWord = () => {
    if (!data.length) return alert("Ma'lumot yo‘q");

    const headers = ['#', 'Narxi', 'Izoh', 'Sana'];
    const columnWidths = [500, 1500, 4000, 2000];

    const createCell = (text, width, align = AlignmentType.CENTER, bold = false) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: 'center',
        children: [
          new Paragraph({
            alignment: align,
            children: [new TextRun({ text, bold })],
          }),
        ],
        shading: {
          fill: 'ffffff',
          type: ShadingType.CLEAR,
          color: '000000',
        },
      });

    const headerRow = new TableRow({
      children: headers.map((text, i) =>
        new TableCell({
          width: { size: columnWidths[i], type: WidthType.DXA },
          verticalAlign: 'center',
          shading: {
            fill: 'f0f0f0',
            type: ShadingType.CLEAR,
            color: '000000',
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: text.toUpperCase(), bold: true })],
            }),
          ],
        })
      ),
    });

    const bodyRows = data.map((item, index) =>
      new TableRow({
        children: [
          createCell((index + 1).toString(), columnWidths[0]),
          createCell(item.price?.toString() || '', columnWidths[1]),
          createCell(item.description || '', columnWidths[2]),
          createCell(item.created_at?.slice(0, 10) || '', columnWidths[3]),
        ],
      })
    );

    const totalSumma = data.reduce((acc, item) => acc + (item.price || 0), 0);

    const totalRow = new TableRow({
      children: [
        createCell('', columnWidths[0]),
        createCell('Jami', columnWidths[1], AlignmentType.RIGHT, true),
        createCell(totalSumma.toLocaleString() + " so'm", columnWidths[2], AlignmentType.CENTER, true),
        createCell('', columnWidths[3]),
      ],
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'Qo‘shimcha chiqimlar ro‘yxati',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Table({
              rows: [headerRow, ...bodyRows, totalRow],
              width: { size: 10000, type: WidthType.DXA },
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'qoshimcha_chiqimlar.docx');
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <LayoutComponent>
      <AdminHeader title="Qo‘shimcha chiqimlar" onCreate={() => setModalOpen(true)} />

      <ChiqimFilter
        filter={filter}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onExport={handleExportToWord}
      />

      <AdminTable
        title="Qo‘shimcha chiqimlar ro‘yxati"
        columns={['id', 'price', 'description', 'created_at']}
        columnTitles={{
          id: 'ID',
          price: 'Narxi',
          description: 'Izoh',
          created_at: 'Vaqti'
        }}
        data={data}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
        Jami summa: {data.reduce((acc, item) => acc + (item.price || 0), 0).toLocaleString()} so'm
      </div>

      <QoshimchaModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </LayoutComponent>
  );
}
