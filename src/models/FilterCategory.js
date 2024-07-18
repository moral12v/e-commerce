import { model, Schema } from 'mongoose';

const filterCatSchema = Schema(
  {
    name: { type: String, index: true, require: true },
    field: { type: String, index: true, require: true },
    multiSelect: { type: Boolean, default: false, require: true },
    type: { type: String, enum: ['range', 'match'], default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const FilterCategory = model('filter_category', filterCatSchema);

export default FilterCategory;
