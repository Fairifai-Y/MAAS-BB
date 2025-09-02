import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Lees CSV bestand
    const csvText = await file.text();
    const lines = csvText.split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Invalid CSV file - no data found' },
        { status: 400 }
      );
    }

    // Parse headers - ondersteun zowel komma's als puntkomma's
    const headers = lines[0].split(/[,;]/).map(h => h.replace(/"/g, '').trim());
    
    // Valideer headers - alleen de essentiële headers zijn verplicht
    const requiredHeaders = ['ID', 'Actief'];
    const optionalHeaders = ['Bedrijf', 'Telefoon', 'Adres'];
    
    // Controleer of alle verplichte headers aanwezig zijn
    const missingRequiredHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingRequiredHeaders.length > 0) {
      return NextResponse.json(
        { error: `Invalid CSV format - missing required headers: ${missingRequiredHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse data rijen
    const dataRows = lines.slice(1).filter(line => line.trim());
    const results = {
      updated: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < dataRows.length; i++) {
      const line = dataRows[i];
      const values = line.split(/[,;]/).map(v => v.replace(/"/g, '').trim());
      
      if (values.length !== headers.length) {
        results.errors.push(`Row ${i + 2}: Invalid number of columns`);
        continue;
      }

      const rowData = headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as Record<string, string>);

      try {
        // Update klant data
        const customerId = rowData['ID'];
        const isActive = rowData['Actief'] === 'Ja';
        const company = rowData['Bedrijf'];
        const phone = rowData['Telefoon'];
        const address = rowData['Adres'];

        // Update customer record
        await prisma.customers.update({
          where: { id: customerId },
          data: {
            isActive,
            company: company || null,
            phone: phone || null,
            address: address || null,
            updatedAt: new Date()
          }
        });

        results.updated++;
      } catch (error) {
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: `Import completed. Updated ${results.updated} customers.`,
      updated: results.updated,
      errors: results.errors
    });

  } catch (error) {
    console.error('Failed to import customers:', error);
    return NextResponse.json(
      { error: 'Failed to import customers' },
      { status: 500 }
    );
  }
}
