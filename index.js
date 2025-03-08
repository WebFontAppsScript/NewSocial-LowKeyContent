const express = require('express');
const axios = require('axios');

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/nos', async (req, res) => {
  
  const xmlUrl = req.query.ifr;
  if (!xmlUrl) {
    return res.status(400).send('Missing "ifr" query parameter');
  }
  
  try {
    
    const response = await axios.get(xmlUrl);
    let xmlData = response.data;
    
    
    const xmlDeclarationRegex = /<\?xml.*?\?>/;
    if (xmlDeclarationRegex.test(xmlData)) {
      xmlData = xmlData.replace(xmlDeclarationRegex, match => 
        `${match}\n<?xml-stylesheet type="text/xsl" href="/xsl"?>`
      );
    } else {
      
      xmlData = '<?xml-stylesheet type="text/xsl" href="/xsl"?>\n' + xmlData;
    }
    
    
    res.set('Content-Type', 'text/xml');
    res.send(xmlData);
  } catch (error) {
    res.status(500).send('Error fetching XML: ' + error.message);
  }
});


app.get('/xsl', (req, res) => {
  const xsltContent = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8"/>
  
  <!-- Template for the root Module element -->
  <xsl:template match="/Module">
    <html>
      <head>
        <title>
          <xsl:value-of select="ModulePrefs/@title"/>
        </title>
      </head>
      <body>
        <xsl:apply-templates select="Content"/>
      </body>
    </html>
  </xsl:template>
  
  <!-- Template for the Content element.
       disable-output-escaping renders the inner HTML as HTML -->
  <xsl:template match="Content">
    <xsl:value-of select="." disable-output-escaping="yes"/>
  </xsl:template>
</xsl:stylesheet>`;
  
  res.type('text/xsl');
  res.send(xsltContent);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
