<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>
  <xsl:template match="/">
    <div class="w3-container w3-padding-32">
      <h3 class="w3-border-bottom w3-border-light-grey w3-padding-16">{{Messages['projects.title']}}</h3>
    </div>
    <!-- Outer iteration for the rows -->
    <xsl:for-each select="/portfolio/project">
      <!-- Number of entries per row -->
      <xsl:variable name="size" select="4"/>
      <xsl:if test="((position() -1) mod $size) = 0">
        <xsl:variable name="start" select="position()"/>
        <div class="w3-row-padding w3-grayscale">
          <!-- Outer iteration for the columns -->
          <xsl:for-each select="/portfolio/project">
            <xsl:if test="position() &gt;= $start and position() &lt; ($start +$size)">
              <!-- Content of the column -->
              <div class="w3-col l3 m6 w3-margin-bottom">
                <div class="w3-display-container">
                  <div class="w3-display-topleft w3-black w3-padding"><xsl:value-of select="title"/></div>
                  <!-- Link with path and ID to the project-face -->
                  <a href="#project#{id}">
                    <img src="./assets/images/house{id}.jpg" alt="{title}"/>
                  </a>
                </div>
              </div>      
            </xsl:if>
          </xsl:for-each>
        </div>
      </xsl:if>    
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>