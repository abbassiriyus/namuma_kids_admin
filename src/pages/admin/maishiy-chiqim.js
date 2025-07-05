"use client";

import { useState, useEffect } from "react";
import LayoutComponent from "@/components/LayoutComponent";
import AdminTable from "@/components/AdminTable";
import MaishiyChiqimModal from "@/components/MaishiyChiqimModal";
import ChiqimFilter from "@/components/ChiqimFilter";
import AdminHeader from "@/components/AdminHeader";
import axios from "axios";
import url from "@/host/host";
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
} from "docx";
import { saveAs } from "file-saver";

export default function MaishiyChiqimPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', productId: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [res, prodRes] = await Promise.all([
        axios.get(`${url}/chiqim_maishiy`, authHeader),
        axios.get(`${url}/sklad_maishiy`, authHeader),
      ]);

      const productMap = {};
      prodRes.data.forEach(p => {
        productMap[p.id] = { nomi: p.nomi, hajm_birlik: p.hajm_birlik };
      });

      const enriched = res.data.map(item => ({
        ...item,
        hajm: item.hajm != null ? parseFloat(item.hajm).toString() : '',
        product_nomi: productMap[item.sklad_product_id]?.nomi || 'Noma’lum',
        hajm_birlik: productMap[item.sklad_product_id]?.hajm_birlik || ''
      }));

      setData(enriched);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const handleSave = async (form) => {
    try {
      if (Array.isArray(form)) {
        await axios.post(`${url}/chiqim_maishiy/multi`, form, authHeader);
      } else if (editingItem) {
        await axios.put(`${url}/chiqim_maishiy/${editingItem.id}`, form, authHeader);
      } else {
        await axios.post(`${url}/chiqim_maishiy`, form, authHeader);
      }
      fetchData();
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${url}/chiqim_maishiy/${id}`, authHeader);
      fetchData();
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
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
      if (filter.productId) params.append('product', filter.productId);

      const [res, prodRes] = await Promise.all([
        axios.get(`${url}/chiqim_maishiy?${params.toString()}`, authHeader),
        axios.get(`${url}/sklad_maishiy`, authHeader),
      ]);

      const productMap = {};
      prodRes.data.forEach(p => {
        productMap[p.id] = { nomi: p.nomi, hajm_birlik: p.hajm_birlik };
      });

      const enriched = res.data.map(item => ({
        ...item,
        hajm: item.hajm != null ? parseFloat(item.hajm).toString() : '',
        product_nomi: productMap[item.sklad_product_id]?.nomi || 'Noma’lum',
        hajm_birlik: productMap[item.sklad_product_id]?.hajm_birlik || ''
      }));

      setData(enriched);
      setProducts(prodRes.data);
    } catch (err) {
      console.error("Filterda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportToWord = () => {
    if (!data.length) return alert("Ma'lumot yo‘q");

    const headers = ['#', 'Mahsulot', 'Hajm', 'Birlik', 'Izoh', 'Sana'];
    const columnWidths = [500, 2000, 1000, 1000, 3000, 2000];

    const createCell = (text, width, align = AlignmentType.CENTER, bold = false) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: align,
            children: [new TextRun({ text, bold })],
          }),
        ],
        shading: { fill: 'ffffff', type: ShadingType.CLEAR, color: '000000' },
      });

    const headerRow = new TableRow({
      children: headers.map((text, i) =>
        new TableCell({
          width: { size: columnWidths[i], type: WidthType.DXA },
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
          createCell(item.product_nomi, columnWidths[1]),
          createCell(item.hajm?.toString() || '', columnWidths[2]),
          createCell(item.hajm_birlik || '', columnWidths[3]),
          createCell(item.description || '', columnWidths[4]),
          createCell(item.chiqim_sana?.slice(0, 10) || '', columnWidths[5]),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'Maishiy chiqimlar ro‘yxati',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Table({ rows: [headerRow, ...bodyRows] }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'maishiy_chiqimlar.docx');
    });
  };

  return (
    <LayoutComponent>
      <AdminHeader
        title="🧹 Maishiy chiqimlar"
        onCreate={() => setModalOpen(true)}
      />

      <ChiqimFilter
        filter={{ ...filter, products }}
        onChange={handleFilterChange}
        onSubmit={handleFilterSubmit}
        onExport={handleExportToWord}
      />

      <AdminTable
        title="Chiqimlar"
        columns={['id', 'product_nomi', 'hajm', 'hajm_birlik', 'description', 'chiqim_sana']}
        columnTitles={{
          id: 'ID',
          product_nomi: 'Mahsulot',
          hajm: 'Hajm',
          hajm_birlik: 'Birlik',
          description: 'Izoh',
          chiqim_sana: 'Sana',
        }}
        data={data}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <MaishiyChiqimModal
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
