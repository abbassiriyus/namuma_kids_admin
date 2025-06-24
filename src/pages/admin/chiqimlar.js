'use client';

import { useEffect, useState } from 'react';
import LayoutComponent from '@/components/LayoutComponent';
import AdminHeader from '@/components/AdminHeader';
import AdminTable from '@/components/AdminTable';
import axios from 'axios';
import url from '@/host/host';
import ChiqimModal from '@/components/ChiqimModal'; // Yaratiladigan modal
import styles from '@/styles/ChiqimlarPage.module.css';
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
  BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
export default function ChiqimOmborPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
const [filter, setFilter] = useState({
  startDate: '',
  endDate: '',
  productId: ''
});
const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilter(prev => ({ ...prev, [name]: value }));
};

// ????
const handleExportToWord = () => {
  if (!data.length) return alert("Export qilish uchun ma'lumot yo‘q");

  const headers = ['#', 'Mahsulot', 'Hajm', 'Birlik', 'Izoh', 'Chiqim sanasi'];

  const columnWidths = [500, 2000, 1000, 1000, 4000, 1800, 1800]; // kengroq qilingan

  const createCell = (text, width, align = AlignmentType.CENTER, bold = false) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      verticalAlign: 'center',
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text, bold, color: '000000' })],
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
          fill: 'f0f0f0', // ozroq fon rangi
          type: ShadingType.CLEAR,
          color: '000000',
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: text.toUpperCase(), bold: true, color: '000000' })],
          }),
        ],
      })
    ),
  });
data.push({})
  const bodyRows = data.map((item, index) =>
    new TableRow({
      children: [
        createCell((index + 1).toString(), columnWidths[0]),
        createCell(item.product_nomi || '', columnWidths[1]),
        createCell(item.hajm?.toString() || '', columnWidths[2]),
        createCell(item.hajm_birlik || '', columnWidths[3]),
        createCell(item.description || '', columnWidths[4]),
        createCell(item.chiqim_sana?.slice(0, 10) || '', columnWidths[5]),
      ],
    })
  );

  const table = new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 10000, type: WidthType.DXA }, // sahifaning 100% i
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Chiqimlar ro‘yxati',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          table,
        ],
      },
    ],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, 'chiqimlar.docx');
  });
};

// ??

const handleFilterSubmit = async () => {
  try {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('start', filter.startDate);
    if (filter.endDate) params.append('end', filter.endDate);
    if (filter.productId) params.append('product', filter.productId);

    const [res, productsRes] = await Promise.all([
      axios.get(`${url}/chiqim_ombor?${params.toString()}`, authHeader),
      axios.get(`${url}/sklad_product`, authHeader),
    ]);

    const productMap = {};
    productsRes.data.forEach(p => {
      productMap[p.id] = p.nomi;
    });

    const enriched = res.data.map(item => ({
      ...item,
      product_nomi: productMap[item.sklad_product_id] || '',
      hajm_birlik: productsRes.data.find(p => p.id === item.sklad_product_id)?.hajm_birlik || '',
    }));

    setData(enriched);
    setProducts(productsRes.data);
  } catch (err) {
    console.error('Filterlashda xatolik:', err);
  }
};

  const fetchData = async () => {
    try {
      const [res, productsRes] = await Promise.all([
        axios.get(`${url}/chiqim_ombor`, authHeader),
        axios.get(`${url}/sklad_product`, authHeader),
      ]);

      const productMap = {};
      productsRes.data.forEach(p => {
        productMap[p.id] = p.nomi;
      });

         const enriched = res.data.map(item => ({
      ...item,
      product_nomi: productMap[item.sklad_product_id] || '',
      hajm_birlik: productsRes.data.find(p => p.id === item.sklad_product_id)?.hajm_birlik || '',
    }));

      setData(enriched);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Xatolik:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 const handleSave = async (form) => {
  try {
    if (Array.isArray(form)) {
      // bulk POST
      await axios.post(`${url}/chiqim_ombor/bulk`, form, authHeader);
    } else {
      // single PUT
      await axios.put(`${url}/chiqim_ombor/${form.id}`, form, authHeader);
    }
    fetchData();
  } catch (err) {
    console.error("Saqlashda xatolik:", err);
  }
};


  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/chiqim_ombor/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error('O‘chirishda xatolik:', err);
    }
  };

  return (
    <LayoutComponent>
      <AdminHeader title="Chiqim Ombori" onCreate={() => setModalOpen(true)} />
<ChiqimFilter
  filter={{ ...filter, products }}
  onChange={handleFilterChange}
  onSubmit={handleFilterSubmit}
  onExport={handleExportToWord}
/>
   <AdminTable
  title="Chiqimlar ro'yxati"
   columns={['id', 'product_nomi', 'hajm', 'hajm_birlik', 'description', 'chiqim_sana', 'created_at']}
  columnTitles={{
    id: 'ID',
    product_nomi: 'Mahsulot',
    hajm: 'Hajm',
    hajm_birlik: 'Birlik',
    description: 'Izoh',
    chiqim_sana: 'Chiqim sanasi',
    created_at: 'Yaratilgan sana',
  }}
  data={data}
  onEdit={(item) => {
    setEditingItem(item);
    setModalOpen(true);
  }}
  onDelete={handleDelete}
/>

      <ChiqimModal
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
