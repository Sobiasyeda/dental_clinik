"""changes

Revision ID: 73ed1f4592b4
Revises: 51d4020760b2
Create Date: 2024-09-29 21:58:18.819861

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73ed1f4592b4'
down_revision = '51d4020760b2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('reminders_sent', schema=None) as batch_op:
        batch_op.add_column(sa.Column('clinic_name', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('reminders_sent', schema=None) as batch_op:
        batch_op.drop_column('clinic_name')

    # ### end Alembic commands ###
