<script lang="ts">
  type T = $$Generic

  export let data: T[] = []
  export let columns: {
    key: keyof T
    title: string
    width?: string
    render?: (row: T, index: number) => any
  }[] = []
</script>

<div class="table-wrap">
  <table class="data-table">
    <thead>
      <tr>
        {#each columns as col}
          <th style={col.width ? `width: ${col.width}` : ''}>{col.title}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row, i}
        <tr>
          {#each columns as col}
            <td>
              {#if col.render}
                {@html col.render(row, i)}
              {:else}
                {String(row[col.key])}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrap {
    overflow-x: auto;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: #334155;
  }
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  th {
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
  }
  tr:hover td {
    background: #f1f5f9;
  }
</style>
