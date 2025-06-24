import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';

export const exportChiqimlarToDocx = (data = []) => {
  if (!data.length) return alert("Ma'lumot yo‘q!");

  const rows = [
    new TableRow({
      children: [
        '№', 'Mahsulot', 'Hajm', 'Birlik', 'Izoh', 'Chiqim sanasi', 'Yaratilgan'
      ].map(header =>
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })]
        })
      )
    }),
    ...data.map((item, i) =>
      new TableRow({
        children: [
          i + 1,
          item.product_nomi,
          item.hajm,
          item.hajm_birlik,
          item.description,
          item.chiqim_sana?.slice(0, 10),
          item.created_at?.slice(0, 10)
        ].map(cell =>
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph(cell?.toString() || '')]
          })
        )
      })
    )
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Chiqimlar ro'yxati",
          heading: "Heading1",
          spacing: { after: 300 }
        }),
        new Table({
          rows
        })
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, "chiqimlar.docx");
  });
};
