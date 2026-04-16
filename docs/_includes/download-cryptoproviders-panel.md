{% comment %}
Parameter `major` or `version` must be specified
Parameter `components` must be specified
Parameter `title_details` may be specified
{% endcomment %}
<blockquote class="panel download">
<p><strong>Download Crypto Providers {%- if include.title_details != nil %} ({{ include.title_details }}) {%- endif -%}</strong></p>
{%- assign components_arr = include.components | split: "," -%}
{%- if include.version == nil -%}
<p>
These download links refer to the latest available {{ include.major }}.x version. This is recommended for automated downloads from build scripts. See <a href="/changelog/">Product changes</a> for stable links to a specific version. SignPath Crypto Providers use <a href="https://semver.org/">semantic versioning</a>.

</p>
   {%- assign major_version = include.major -%}
{%- else -%}
   {%- assign major_version = include.version | split: "." | first -%}
{%- endif --%}
{%- assign latest_version = major_version | append: "-latest" -%}
<table>
   {%- if include.version != nil -%}
     <tr>
       <th></th>
       <th>{{ latest_version}} (recommended)</th>
       <th>{{ include.version }}</th>
     </tr>
   {%- endif -%}
   {%- for cp in site.data.download_links.cryptoproviders.v1 -%}
     {%- if components_arr contains cp.id -%}
        <tr>
          <td data-label="Type">{{ cp.name }}</td>
          <td data-label="{{ latest_version }}">
             {%- for link in cp.links -%}
             <a href="{{ link.link | replace: '$VERSION', latest_version }}">{{ link.text }}</a>{%- if forloop.last != true -%}&nbsp;&nbsp;|&nbsp;&nbsp;{%- endif -%} 
             {%- endfor -%}
          </td>
          {%- if include.version != nil -%}
            <td data-label="{{ include.version }}">
               {%- for link in cp.links -%}
             <a href="{{ link.link | replace: '$VERSION', include.version }}">{{ link.text }}</a>{%- if forloop.last != true -%}&nbsp;&nbsp;|&nbsp;&nbsp;{%- endif -%} 
             {%- endfor -%}
            </td>
          {%- endif -%}
        </tr>
      {%- endif -%}
    {%- endfor -%}
</table>
</blockquote>