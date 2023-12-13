<template>
  <!-- <label>Search:</label> -->
  <input
    class="searchBar"
    type="text"
    placeholder="Search by Title or Actor..."
    :value="searchQuery"
    @input="$emit('update:searchQuery', $event.target.value)"
  />
</template>
<script>
export default {
  props: ['searchQuery'],
  emits: ['update:searchQuery'],
};
</script>
