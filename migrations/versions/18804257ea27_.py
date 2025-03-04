"""empty message

Revision ID: 18804257ea27
Revises: ea207ec64a17
Create Date: 2025-01-15 22:43:30.511846

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '18804257ea27'
down_revision = 'ea207ec64a17'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('userFacebook', schema=None) as batch_op:
        batch_op.alter_column('token_code',
               existing_type=mysql.VARCHAR(length=255),
               type_=sa.Text(),
               existing_nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('userFacebook', schema=None) as batch_op:
        batch_op.alter_column('token_code',
               existing_type=sa.Text(),
               type_=mysql.VARCHAR(length=255),
               existing_nullable=True)

    # ### end Alembic commands ###
