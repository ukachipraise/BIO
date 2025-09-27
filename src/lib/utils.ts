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
          "The `records` variable below holds all the captured data. You may need to install pandas, Pillow and matplotlib (`pip install pandas Pillow matplotlib`) to run the cells."
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
          "import base64\n",
          "from PIL import Image as PILImage\n",
          "import io\n",
          "import math\n",
          "import numpy as np\n",
          "import matplotlib.pyplot as plt\n\n",
          `records = ${JSON.stringify(data, null, 2)}`
        ]
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          "## Helper Functions for Data Conversion and Display\n\n",
          "These functions help decode the `data URI` strings into viewable images. The most important function, `binary_to_image`, demonstrates how raw binary data can be converted into an image. **Note:** This requires making assumptions about the image dimensions, as this information is not present in raw binary files."
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "def data_uri_to_binary(data_uri):\n",
          "    \"\"\"Extracts raw binary data from a data URI.\"\"\"\n",
          "    if not data_uri or ';base64,' not in data_uri:\n",
          "        return None\n",
          "    return base64.b64decode(data_uri.split(',')[1])\n\n",
          "def binary_to_image(binary_data, width=256, height=256):\n",
          "    \"\"\"Converts raw binary data to a Pillow Image object, assuming dimensions.\"\"\"\n",
          "    if not binary_data:\n",
          "        return None\n",
          "    \n",
          "    # Assume 8 bits per pixel (grayscale)\n",
          "    expected_size = width * height\n",
          "    if len(binary_data) < expected_size:\n",
          "        print(f\"Warning: Binary data is smaller than expected. Padding with zeros.\")\n",
          "        padding = bytes(expected_size - len(binary_data))\n",
          "        binary_data += padding\n",
          "    elif len(binary_data) > expected_size:\n",
          "        print(f\"Warning: Binary data is larger than expected. Truncating.\")\n",
          "        binary_data = binary_data[:expected_size]\n",
          "        \n",
          "    try:\n",
          "        # Create a grayscale image from the binary data\n",
          "        img = PILImage.frombytes('L', (width, height), binary_data)\n",
          "        return img\n",
          "    except Exception as e:\n",
          "        print(f\"Error converting binary to image: {e}\")\n",
          "        return None\n\n",
          "def display_image(image_data):\n",
          "    \"\"\"Displays an image from either a data URI or a Pillow Image object.\"\"\"\n",
          "    if isinstance(image_data, str) and image_data.startswith('data:image'):\n",
          "        display(Image(data=data_uri_to_binary(image_data)))\n",
          "    elif isinstance(image_data, PILImage.Image):\n",
          "        plt.imshow(image_data, cmap='gray')\n",
          "        plt.axis('off')\n",
          "        plt.show()\n",
          "    elif image_data is None:\n",
          "        print(\"No image data to display.\")\n",
          "    else:\n",
          "        print(f\"Cannot display data of type: {type(image_data)}\")"
        ]
      },
       {
        cell_type: "markdown",
        metadata: {},
        source: [
          "## Convert to Pandas DataFrame\n\n",
          "For easier analysis, we can flatten the data into a Pandas DataFrame. The 'scanned' columns will be converted from binary data to image objects."
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          "wide_data = []\n",
          "for record in records:\n",
          "    # For scanned data, convert from binary data URI to a Pillow image object\n",
          "    scanned_index_bin = data_uri_to_binary(record['images'].get('SCANNER_INDEX', {}).get('dataUri', None))\n",
          "    scanned_thumb_bin = data_uri_to_binary(record['images'].get('SCANNER_THUMB', {}).get('dataUri', None))\n",
          "    \n",
          "    row = {\n",
          "        'id': record['id'],\n",
          "        'date': record['timestamp'],\n",
          "        'Photo index': record['images'].get('CAMERA_INDEX', {}).get('dataUri', None),\n",
          "        'scanned index': binary_to_image(scanned_index_bin), # Converted to image object\n",
          "        'photo thumb': record['images'].get('CAMERA_THUMB', {}).get('dataUri', None),\n",
          "        'scanned thumb': binary_to_image(scanned_thumb_bin), # Converted to image object\n",
          "    }\n",
          "    wide_data.append(row)\n\n",
          "df = pd.DataFrame(wide_data)\n\n",
          "# Reorder columns\n",
          "df = df[['id', 'date', 'Photo index', 'scanned index', 'photo thumb', 'scanned thumb']]\n\n",
          "# Show the dataframe info to confirm types\n",
          "df.info()\n\n",
          "# Display the dataframe. Scanned columns will show as Pillow image objects.\n",
          "display(df)"
        ]
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: [
            "## Displaying Images from the DataFrame\n\n",
            "You can now access any image from the DataFrame and display it. For example, let's display the scanned index finger from the first record."
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
            "if not df.empty:\n",
            "    print(\"Displaying Photo Index from first record:\")\n",
            "    display_image(df.iloc[0]['Photo index'])\n",
            "    \n",
            "    print(\"\\nDisplaying Scanned Index (converted from binary) from first record:\")\n",
            "    display_image(df.iloc[0]['scanned index'])\n",
            "else:\n",
            "    print(\"DataFrame is empty. No records to display.\")"
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
