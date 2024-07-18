import { model, Schema } from 'mongoose';

const filterValueSchema = Schema(
  {
    filterCategoryId: { type: Schema.ObjectId, index: true, require: true, ref: 'filter_category' },
    title: { type: String, require: true },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    match: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const FilterValue = model('filter_value', filterValueSchema);

export default FilterValue;
