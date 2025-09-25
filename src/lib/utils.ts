import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
