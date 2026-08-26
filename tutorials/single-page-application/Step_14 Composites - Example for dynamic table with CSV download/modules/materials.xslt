<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html"/>
  
  <!--
  
    For sorting, the two parameters column and reverse are passed to the XSLT processor.
   
  -->
  
  <xsl:param name="column"/>
  <xsl:param name="reverse"/>
  <xsl:variable name="order">
    <xsl:choose>
      <xsl:when test="$reverse='true'">descending</xsl:when>
      <xsl:otherwise>ascending</xsl:otherwise>
    </xsl:choose>    
  </xsl:variable>
  
  <!--
  
    The transformation is a mix of XPath and Expression-Language.
    The Expression Language is completely ignored during the XML transformation
    and is only resolved by the MutationObserver after the DocumentFragment has been inserted into the DOM.   
  
  --> 
  
  <xsl:template match="/">
    <xsl:variable name="style">
      <xsl:choose>
        <xsl:when test="$column!=''">
          sorted
          <xsl:value-of select="concat($column, ' ', $order)"/>
        </xsl:when>
      </xsl:choose>    
    </xsl:variable>  
    <table class="w3-table w3-striped w3-border {$style}" release="">
      <thead>
        <tr class="w3-orange">
          <th>
            <!--
            
              The a-tag and the functional path (###) are only used to make the headers accessible via tab.
              It can also be removed.
              The assignment of Java-Script is not necessary.
              The events are taken over by the abstract table class.
            
            -->
            <a tabindex="0" id="id" class="sortable sortable-default">
              {{Messages['materials.id.title']}}
            </a>
          </th>
          <th>
            <a tabindex="0" id="density" class="sortable">
              {{Messages['materials.density.title']}}
            </a>
          </th>
          <th colspan="2">
            <a tabindex="0" id="pei" class="sortable">
              {{Messages['materials.pei.title']}}
            </a>
          </th>
          <th>
            <a tabindex="0" id="tc" class="sortable">
              {{Messages['materials.tc.title']}}
            </a>
          </th>
          <th>
            <a tabindex="0" id="drf" class="sortable">
              {{Messages['materials.drf.title']}}
            </a>
          </th> 
        </tr>
        <tr class="w3-orange">
          <th></th> 
          <th>
            <a tabindex="0" id="density" class="sortable">
              kg/m³
            </a>
          </th>
          <th>
            <a tabindex="0" id="pei_1" class="sortable">
              MJ/m³
            </a>
          </th>
          <th>
            <a tabindex="0" id="pei_2" class="sortable">
              kWh/m³
            </a>
          </th>
          <th>
            <a tabindex="0" id="tc" class="sortable">
              W/(mK)
            </a>
          </th>
          <th>
            <a tabindex="0" id="drf" class="sortable">
              μ
            </a>
          </th>
        </tr>        
      </thead>
      <tbody>
        <xsl:for-each select="/set/data">
          <!--
          
            Sorting by pei does not work correctly, because a combined sorting of the fields pei_1 and pei_2 is required.
            If I find a solution with XPath 1.0, I will fix it.
             
          -->
          <xsl:sort select="*[name()=$column]" data-type="number" order="{$order}"/>
          <tr>
            <td>
              {{Messages['material.title']}}
              <xsl:value-of select="id"/>
            </td>
            <!--
            
              The output data is formatted according to the current language setting.
             
            -->
            <td>
              {{ui.text.format('<xsl:value-of select="density"/>', materials.FORMAT_DENSITY)}}
            </td>
            <td>
              {{ui.text.format('<xsl:value-of select="pei_1"/>', materials.FORMAT_PEI)}}
            </td>
            <td>
              {{ui.text.format('<xsl:value-of select="pei_2"/>', materials.FORMAT_PEI)}}
            </td>
            <td>
              {{ui.text.format('<xsl:value-of select="tc"/>', materials.FORMAT_TC)}}
            </td>
            <td>
              {{'<xsl:value-of select="drf"/>' eq '-1' ? '' : ui.text.format('<xsl:value-of select="drf"/>', materials.FORMAT_DRF)}}
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
    <button id="download" class="w3-button w3-black w3-section">
      <i class="fa fa-download"></i> {{Messages['common.text.download']}}
    </button>
  </xsl:template>
</xsl:stylesheet>