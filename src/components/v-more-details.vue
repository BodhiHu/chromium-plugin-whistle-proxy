<template>
    <div class="more-details">
        <span v-html="html" style="margin-right: 5px"></span>
        <i class="el-icon-arrow-down" v-if="items.length > 1 && !isOpen" @click="isOpen=true"></i>
        <i class="el-icon-arrow-up" v-if="items.length > 1 && isOpen" @click="isOpen=false"></i>
    </div>
</template>

<script>
    export default {
        name: "v-more-details",
        data() {
            return {
                isOpen: false
            };
        },
        props: {
            items: {
                defaults: []
            }
        },
        computed: {
            html() {
                if (this.items.length < 2 || !this.isOpen) {
                    return this.items[0];
                }
                return this.items.join('<br>');
            }
        }
    }
</script>