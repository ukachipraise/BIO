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
        // For binary files, we save a reference, for others the full data URI
        const urlToSave = image.isBinary ? `[Binary data for ${image.fileName}]` : image.url;
        sqlContent += `INSERT INTO images (record_id, step_id, url, quality_score, blur_level, lighting_condition, feedback) VALUES (
          ${escapeSql(record.id)},
          ${escapeSql(image.stepId)},
          ${escapeSql(urlToSave)},
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


export function exportToCsv<T extends object>(data: T[], fileName:string) {
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

export function exportToIpynb(data: CapturedDataSet[], fileName: string) {
  if (data.length === 0) {
    return;
  }

  const notebook = {
    cells: [
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          "# Biometric Capture Data\n\n",
          `This notebook contains data exported from the Biometric Capture Pro application on ${new Date().toISOString()}.\n\n`,
          "The `records` variable below holds all the captured data."
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "import json\n",
          "import pandas as pd\n",
          "from IPython.display import display, Image\n",
          "import base64\n\n",
          `records = ${JSON.stringify(data, null, 2)}`
        ]
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          "## Data Overview\n\n",
          "The `records` object is a list of dictionaries. Each dictionary represents one capture session and contains the session ID, timestamp, and a dictionary of the captured images."
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "def get_image_data(record_id, step_id):\n",
          "    for record in records:\n",
          "        if record['id'] == record_id:\n",
          "            if step_id in record['images']:\n",
          "                return record['images'][step_id]\n",
          "    return None\n\n",
          "def display_image_from_uri(data_uri):\n",
          "    if not data_uri or ';base64,' not in data_uri:\n",
          "        print(\"Invalid or empty data URI\")\n",
          "        return\n",
          "    # We only display images, not binary files\n",
          "    if data_uri.startswith('data:image'):\n",
          "        display(Image(data=base64.b64decode(data_uri.split(',')[1])))\n",
          "    else:\n",
          "        print(f\"Cannot display non-image data URI: {data_uri[:50]}...\")\n\n",
          "# Example: Display the first image of the first record\n",
          "if records:\n",
          "    first_record = records[0]\n",
          "    first_image_key = list(first_record['images'].keys())[0]\n",
          "    first_image_data = first_record['images'][first_image_key]\n\n",
          "    print(f\"Displaying {first_image_key} from record {first_record['id']}\")\n",
          "    if not first_image_data.get('isBinary'):\n",
          "        display_image_from_uri(first_image_data.get('dataUri'))\n",
          "    else:\n",
          "        print(f\"This is a binary file: {first_image_data.get('fileName')}\")"
        ]
      },
       {
        cell_type: "markdown",
        metadata: {},
        source: [
          "## Convert to Pandas DataFrame\n\n",
          "For easier analysis, we can flatten the data into a Pandas DataFrame."
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "flattened_data = []\n",
          "for record in records:\n",
          "    for step_id, image_data in record['images'].items():\n",
          "        flat_record = {\n",
          "            'record_id': record['id'],\n",
          "            'timestamp': record['timestamp'],\n",
          "            'step_id': image_data.get('stepId'),\n",
          "            'device': image_data.get('device'),\n",
          "            'is_binary': image_data.get('isBinary', False),\n",
          "            'file_name': image_data.get('fileName'),\n",
          "            'quality_score': image_data.get('qualityFeedback', {}).get('qualityScore'),\n",
          "            'blur_level': image_data.get('qualityFeedback', {}).get('blurLevel'),\n",
          "            'lighting_condition': image_data.get('qualityFeedback', {}).get('lightingCondition'),\n",
          "            'feedback': image_data.get('qualityFeedback', {}).get('feedback'),\n",
          "            # Data URI is kept for access but not for direct display in DataFrame\n",
          "            'data_uri_len': len(image_data.get('dataUri', ''))\n",
          "        }\n",
          "        flattened_data.append(flat_record)\n\n",
          "df = pd.DataFrame(flattened_data)\n\n",
          "display(df)"
        ]
      }
    ],
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      },
      language_info: {
        codemirror_mode: {
          name: "ipython",
          version: 3
        },
        file_extension: ".py",
        mimetype: "text/x-python",
        name: "python",
        nbconvert_exporter: "python",
        pygments_lexer: "ipython3",
        version: "3.10.0"
      }
    },
    nbformat: 4,
    nbformat_minor: 5
  };

  const ipynbContent = JSON.stringify(notebook, null, 2);
  downloadFile(ipynbContent, fileName, 'application/x-ipynb+json');
}
