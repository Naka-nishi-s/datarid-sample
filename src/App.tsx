import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import ExcelJS from "exceljs";
import { ChangeEvent, useState } from "react";

const FileUploadAndDisplay: React.FC = () => {
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);

  console.log(columns);
  console.log(rows);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (!files) {
      return;
    }

    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result;
        if (buffer) {
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer as ArrayBuffer);

          const worksheet = workbook.worksheets[0];
          const json: any[] = [];

          worksheet.eachRow((row, rowNumber) => {
            if (row.values) {
              if (rowNumber === 1) {
                const header = row.values.slice(1) as string[];
                const cols = header.map((header) => ({
                  field: header,
                  headerName: header,
                  width: 150,
                }));
                setColumns(cols);
              } else {
                const data = row.values.slice(1);
                const rowObject: { [key: string]: any } = {};
                const currentColumns = columns.length > 0 ? columns : [];
                currentColumns.forEach((col, index) => {
                  rowObject[col.field] = data[index];
                });
                json.push({ id: rowNumber - 2, ...rowObject });
              }
            }
          });

          setRows(json);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div style={{ height: 400, width: "100%" }}>
      <input
        type="file"
        id="file"
        // style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* <label htmlFor="file">
        <button type="button">ファイルを選択</button>
      </label> */}
      {rows.length > 0 && <DataGrid rows={rows} columns={columns} />}
    </div>
  );
};

export default FileUploadAndDisplay;
