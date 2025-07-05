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
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';

export default function KirimlarPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', productId: '' });
  const [searchQuery, setSearchQuery] = useState("");  // Search query state

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const enrichData = (takticData, productsData) => {
    const productsMap = {};
    productsData.forEach(p => {
      productsMap[p.id] = { nomi: p.nomi, hajm_birlik: p.hajm_birlik };
    });

    return takticData.map(item => {
      const narx = Number(item.narx || 0);
      const hajm = Number(item.hajm || 0);
      const summa = (narx * hajm).toFixed(2);

      return {
        ...item,
        product_nomi: productsMap[item.sklad_product_id]?.nomi || 'Noma’lum',
        hajm_birlik: productsMap[item.sklad_product_id]?.hajm_birlik || '',
        summa: summa,
        hajm: parseFloat(item.hajm).toString(),  // Format hajm and narx
        narx: parseFloat(item.narx).toString(),  
      };
    });
  };

  const fetchData = async () => {
    try {
      const [takticRes, productsRes] = await Promise.all([
        axios.get(`${url}/sklad_product_taktic`, authHeader),
        axios.get(`${url}/sklad_product`, authHeader),
      ]);
      setProducts(productsRes.data);
      setData(enrichData(takticRes.data, productsRes.data));
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/sklad_product_taktic/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    }
  };

  const handleSave = async (form) => {
    try {
      if (editingItem) {
        await axios.put(`${url}/sklad_product_taktic/${editingItem.id}`, form, authHeader);
      } else {
        await axios.post(`${url}/sklad_product_taktic`, form, authHeader);
      }
      fetchData();
      setEditingItem(null);
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
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

      const [takticRes, productsRes] = await Promise.all([
        axios.get(`${url}/sklad_product_taktic?${params.toString()}`, authHeader),
        axios.get(`${url}/sklad_product`, authHeader),
      ]);

      setProducts(productsRes.data);
      setData(enrichData(takticRes.data, productsRes.data));
    } catch (err) {
      console.error("Filterlashda xatolik:", err);
    }
  };

  // Search filter function
  const filteredData = data.filter(item => {
    return item.product_nomi.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleExportToWord = () => {
    if (!filteredData.length) return alert("Ma'lumot yo‘q");

    const headers = ['#', 'Mahsulot', 'Hajm', 'Birlik', 'Narx', 'Umumiy', 'Izoh', 'Vaqti'];
    const columnWidths = [500, 2000, 1000, 1000, 1000, 1500, 3000, 2000];

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
        createCell(text.toUpperCase(), columnWidths[i], AlignmentType.CENTER, true)
      ),
    });

    const bodyRows = filteredData.map((item, index) =>
      new TableRow({
        children: [
          createCell((index + 1).toString(), columnWidths[0]),
          createCell(item.product_nomi, columnWidths[1]),
          createCell(item.hajm?.toString(), columnWidths[2]),
          createCell(item.hajm_birlik, columnWidths[3]),
          createCell(item.narx?.toString(), columnWidths[4]),
          createCell((item.summa || 0).toLocaleString(), columnWidths[5]),
          createCell(item.description || '', columnWidths[6]),
          createCell(item.created_at?.slice(0, 10) || '', columnWidths[7]),
        ],
      })
    );

    const total = filteredData.reduce((acc, cur) => acc + (cur.summa || 0), 0);

    const totalRow = new TableRow({
      children: [
        createCell('', columnWidths[0]),
        createCell('Jami', columnWidths[1], AlignmentType.RIGHT, true),
        ...Array(3).fill('').map((_, i) => createCell('', columnWidths[2 + i])),
        createCell(parseFloat(total).toFixed(2).toLocaleString() + " so'm", columnWidths[5], AlignmentType.CENTER, true),
        createCell('', columnWidths[6]),
        createCell('', columnWidths[7]),
      ],
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: 'Kirimlar ro‘yxati',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Table({ rows: [headerRow, ...bodyRows, totalRow], width: { size: 10000, type: WidthType.DXA } }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'kirimlar.docx');
    });
  };

  // Jami summa hisoblash
  const totalSum = filteredData.reduce((acc, item) => acc + (parseFloat(item.summa) || 0), 0);

  return (
    <LayoutComponent>
      <AdminHeader title="Kirimlar" onCreate={() => setModalOpen(true)} />
   
      <ChiqimFilter
        filter={{ ...filter, products }}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onExport={handleExportToWord}
      />   
      <AdminTable
        title="Mahsulot kirimlari"
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
        data={filteredData}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      <div className={styles.totalBox}>
        Jami summa: {parseFloat(totalSum).toFixed(2).toLocaleString()} so'm
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
