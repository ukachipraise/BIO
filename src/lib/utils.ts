import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CapturedDataSet } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId(): string {
  return 'FP-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function urlToDataUri(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to Data URI:", error);
    return "";
  }
}

function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToSql(data: CapturedDataSet[], fileName: string) {
  if (data.length === 0) {
    return;
  }

  const escapeSql = (value: any): string => {
    if (value === null || typeof value === 'undefined') {
      return 'NULL';
    }
    const str = String(value);
    return `'${str.replace(/'/g, "''")}'`;
  };

  let sqlContent = `
-- SQL Export from Biometric Capture Pro
-- Time: ${new Date().toISOString()}

DROP TABLE IF EXISTS records;
CREATE TABLE records (
  id VARCHAR(255) PRIMARY KEY,
  "timestamp" VARCHAR(255)
);

DROP TABLE IF EXISTS images;
CREATE TABLE images (
    record_id VARCHAR(255),
    step_id VARCHAR(255),
    url TEXT,
    quality_score INT,
    blur_level VARCHAR(255),
    lighting_condition VARCHAR(255),
    feedback TEXT,
    PRIMARY KEY (record_id, step_id),
    FOREIGN KEY (record_id) REFERENCES records(id)
);

`;

  for (const record of data) {
    sqlContent += `INSERT INTO records (id, "timestamp") VALUES (${escapeSql(record.id)}, ${escapeSql(record.timestamp)});\n`;

    for (const stepId in record.images) {
      const image = record.images[stepId as keyof typeof record.images];
      if (image) {
        sqlContent += `INSERT INTO images (record_id, step_id, url, quality_score, blur_level, lighting_condition, feedback) VALUES (
          ${escapeSql(record.id)},
          ${escapeSql(image.stepId)},
          ${escapeSql(image.url)},
          ${image.qualityFeedback ? image.qualityFeedback.qualityScore : 'NULL'},
          ${escapeSql(image.qualityFeedback ? image.qualityFeedback.blurLevel : null)},
          ${escapeSql(image.qualityFeedback ? image.qualityFeedback.lightingCondition : null)},
          ${escapeSql(image.qualityFeedback ? image.qualityFeedback.feedback : null)}
        );\n`;
      }
    }
  }

  downloadFile(sqlContent, fileName, 'application/sql');
}


export function exportToCsv<T extends object>(data: T[], fileName: string) {
  if (data.length === 0) {
    return;
  }
  
  const flattenedData = data.map(row => {
    const flatRow: {[key: string]: any} = {};
    for (const key in row) {
        if (typeof (row as any)[key] === 'object' && (row as any)[key] !== null) {
            const nestedObject = (row as any)[key];
            for (const nestedKey in nestedObject) {
                flatRow[`${key}_${nestedKey}`] = nestedObject[nestedKey];
            }
        } else {
            flatRow[key] = (row as any)[key];
        }
    }
    return flatRow;
  });

  const headers = [...new Set(flattenedData.flatMap(row => Object.keys(row)))];
  
  const csvContent = [
    headers.join(','),
    ...flattenedData.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === undefined || value === null) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}
