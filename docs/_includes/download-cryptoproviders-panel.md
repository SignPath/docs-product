{% comment %}
Parameter `major` or `version` must be specified
Parameter `components` must be specified
Parameter `title_details` may be specified
{% endcomment %}
<blockquote class="panel download">
<p><strong>Download Crypto Providers{%- if include.version != nil -%}&nbsp;{{ include.version }}{%- endif -%}{%- if include.title_details != nil -%} ({{ include.title_details }}){%- endif -%}</strong></p>
{%- assign version = include.version -%}
{%- assign components_arr = include.components | split: "," -%}
{%- if include.version == nil -%}
<p>
These download links refer to the latest available {{ include.major }}.x version. This is recommended for automated downloads from build scripts. (SignPath Crypto Providers use semantic versioning.)

Replace `{{include.major}}-latest` in the URL with the specific version number for stable downloads.

</p>
{%- assign version = include.major | append: "-latest" -%}
{%- endif --%}
<table>
   {%- for cp in site.data.download_links.cryptoproviders.v1 -%}
     {%- if components_arr contains cp.id -%}
        <tr>
          <td data-label="Type">{{ cp.name }}</td>
          <td data-label="Download">
             {%- for link in cp.links -%}
             <a href="{{ link.link | replace: '$VERSION', version }}">{{ link.text }}</a>{%- if forloop.last != true -%}&nbsp;&nbsp;|&nbsp;&nbsp;{%- endif -%} 
             {%- endfor -%}
          </td>
        </tr>
      {%- endif -%}
    {%- endfor -%}
</table>
</blockquote>