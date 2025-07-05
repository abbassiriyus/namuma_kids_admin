'use client';

import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import AdminTable from '@/components/AdminTable';
import SkladChiqimModal from '@/components/SkladChiqimModal';
import axios from 'axios';
import url from '@/host/host';
import styles from '@/styles/ChiqimlarPage.module.css';
import AdminHeader from '@/components/AdminHeader';
import ChiqimFilter from '@/components/ChiqimFilter';
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, ShadingType
} from 'docx';
import { saveAs } from 'file-saver';

export default function MaishiyKirimPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', productId: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

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
      if (filter.productId) params.append('product', filter.productId);

      const [kirimRes, productsRes] = await Promise.all([
        axios.get(`${url}/kirim_maishiy?${params.toString()}`, authHeader),
        axios.get(`${url}/sklad_maishiy`, authHeader)
      ]);

      const productsMap = {};
      productsRes.data.forEach(p => {
        productsMap[p.id] = { nomi: p.nomi, hajm_birlik: p.hajm_birlik };
      });

      const enrichedData = kirimRes.data.map(item => ({
        ...item,
        hajm: item.hajm != null ? parseFloat(item.hajm).toFixed(3).replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1') : '',
        product_nomi: productsMap[item.sklad_product_id]?.nomi || 'Noma’lum',
        hajm_birlik: productsMap[item.sklad_product_id]?.hajm_birlik || '',
        summa: (item.hajm || 0) * (item.narx || 0)
      }));

      setData(enrichedData);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Filterlashda xatolik:", err);
    }
  };

  const fetchData = async () => {
    try {
      const [kirimRes, productsRes] = await Promise.all([
        axios.get(`${url}/kirim_maishiy`, authHeader),
        axios.get(`${url}/sklad_maishiy`, authHeader)
      ]);

      const productsMap = {};
      productsRes.data.forEach(p => {
        productsMap[p.id] = { nomi: p.nomi, hajm_birlik: p.hajm_birlik };
      });

      const enrichedData = kirimRes.data.map(item => ({
        ...item,
        hajm: item.hajm != null ? parseFloat(item.hajm).toFixed(3).replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1') : '',
        product_nomi: productsMap[item.sklad_product_id]?.nomi || 'Noma’lum',
        hajm_birlik: productsMap[item.sklad_product_id]?.hajm_birlik || '',
        summa: (item.hajm || 0) * (item.narx || 0)
      }));

      setData(enrichedData);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/kirim_maishiy/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleSave = async (form) => {
    try {
      if (editingItem) {
        await axios.put(`${url}/kirim_maishiy/${editingItem.id}`, form, authHeader);
      } else {
        if (Array.isArray(form)) {
          await Promise.all(form.map(row => axios.post(`${url}/kirim_maishiy/multi`, row, authHeader)));
        } else {
          await axios.post(`${url}/kirim_maishiy/multi`, form, authHeader);
        }
      }
      fetchData();
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
  };

  const handleExportToWord = () => {
    if (!data.length) return alert("Ma'lumot yo‘q");

    const headers = ['#', 'Mahsulot', 'Hajm', 'Birlik', 'Narx', 'Umumiy', 'Izoh', 'Vaqti'];
    const columnWidths = [500, 2000, 1000, 1000, 1000, 1500, 3000, 2000];

    const createCell = (text, width, align = AlignmentType.CENTER, bold = false) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        verticalAlign: 'center',
        children: [new Paragraph({ alignment: align, children: [new TextRun({ text, bold })] })],
        shading: { fill: 'ffffff', type: ShadingType.CLEAR, color: '000000' },
      });

    const headerRow = new TableRow({
      children: headers.map((text, i) =>
        new TableCell({
          width: { size: columnWidths[i], type: WidthType.DXA },
          verticalAlign: 'center',
          shading: { fill: 'f0f0f0', type: ShadingType.CLEAR, color: '000000' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: text.toUpperCase(), bold: true })] })]
        })
      ),
    });

    const bodyRows = data.map((item, index) =>
      new TableRow({
        children: [
          createCell((index + 1).toString(), columnWidths[0]),
          createCell(item.product_nomi || '', columnWidths[1]),
          createCell(item.hajm?.toString() || '', columnWidths[2]),
          createCell(item.hajm_birlik || '', columnWidths[3]),
          createCell(item.narx?.toString() || '', columnWidths[4]),
          createCell((item.summa || 0).toLocaleString(), columnWidths[5]),
          createCell(item.description || '', columnWidths[6]),
          createCell(item.created_at?.slice(0, 10) || '', columnWidths[7]),
        ]
      })
    );

    const totalSumma = data.reduce((acc, item) => acc + (item.summa || 0), 0);

    const totalRow = new TableRow({
      children: [
        createCell('', columnWidths[0]),
        createCell('Jami', columnWidths[1], AlignmentType.RIGHT, true),
        createCell('', columnWidths[2]),
        createCell('', columnWidths[3]),
        createCell('', columnWidths[4]),
        createCell(totalSumma.toLocaleString() + " so'm", columnWidths[5], AlignmentType.CENTER, true),
        createCell('', columnWidths[6]),
        createCell('', columnWidths[7]),
      ]
    });

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: 'Maishiy Kirimlar', heading: 'Heading1', alignment: AlignmentType.CENTER }),
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
      saveAs(blob, 'maishiy_kirimlar.docx');
    });
  };

  return (
    <LayoutComponent>
      <AdminHeader title="Maishiy Kirimlar" onCreate={() => setModalOpen(true)} />

      <ChiqimFilter
        filter={{ ...filter, products }}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onExport={handleExportToWord}
      />

      <AdminTable
        title="Maishiy mahsulot kirimlari"
        columns={['id', 'product_nomi', 'hajm', 'hajm_birlik', 'narx', 'summa', 'description', 'created_at']}
        columnTitles={{
          id: 'ID',
          product_nomi: 'Mahsulot',
          hajm: 'Hajm',
          hajm_birlik: 'Birlik',
          narx: 'Narx',
          summa: 'Umumiy (so‘m)',
          description: 'Izoh',
          created_at: 'Vaqti'
        }}
        data={data}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <div className={styles.totalBox}>
        Jami summa: {data.reduce((acc, item) => acc + (item.summa || 0), 0).toLocaleString()} so'm
      </div>

      <SkladChiqimModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        products={products}
        initialData={editingItem}
      />
    </LayoutComponent>
  );
}
